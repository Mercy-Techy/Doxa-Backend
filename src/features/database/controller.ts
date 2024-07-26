import { Req } from "../../types";
import { Response, NextFunction } from "express";

import { Database } from "./model";
import response from "../../utilities/response";
import { createToken, verifyToken } from "../token/service";
import { User } from "../user/model";
import mailer from "../../service/mailer";
import { mailString, editUser, databaseAccess, removeUser } from "./service";
import { verifyDatabaseName } from "./service";
import { Collection } from "../collection/model";
import Token from "../token/model";
import { Document } from "../document/model";

export const addDatabase = async (
  req: Req,
  res: Response,
  next: NextFunction
) => {
  try {
    const verificationResult = await verifyDatabaseName(
      req.body.name,
      String(req.user?._id)
    );
    if (!verificationResult.status)
      return response(res, 400, verificationResult.message);
    const database = await Database.create({
      name: req.body.name,
      creator: req?.user?._id,
    });
    return response(res, 201, "Database created", database);
  } catch (error) {
    next(error);
  }
};

export const fetchDatabases = async (
  req: Req,
  res: Response,
  next: NextFunction
) => {
  try {
    const databasesArray = [];
    const createdDatabases = await Database.find({ creator: req.user?._id });
    const addedDatabases = await Database.find({
      "users.user": req.user?._id,
    });
    const databases = [...createdDatabases, ...addedDatabases];
    for (let database of databases) {
      const collections = await Collection.count({ database: database._id });
      const documents = await Document.count({ database: database._id });
      databasesArray.push({
        ...database.toObject(),
        collections,
        documents,
      });
    }
    return response(res, 200, "Databases", databasesArray);
  } catch (error) {
    next(error);
  }
};

export const getDatabase = async (
  req: Req,
  res: Response,
  next: NextFunction
) => {
  try {
    const collectionsArray = [];
    const { _id } = req.params;
    const verifyAccess = await databaseAccess(
      String(_id),
      String(req.user?._id),
      ["view", "edit-content", "edit-structure"]
    );
    if (!verifyAccess.status)
      return response(res, 401, verifyAccess.message, null);
    const collections = await Collection.find({
      database: _id,
    });
    for (let collection of collections) {
      const documents = await Document.count({
        database: _id,
        collectionId: collection._id,
      });
      collectionsArray.push({ ...collection.toObject(), documents });
    }
    return response(res, 200, "Database", collectionsArray);
  } catch (error) {
    next(error);
  }
};

export const editDatabase = async (
  req: Req,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, _id } = req.body;
    const verificationResult = await verifyDatabaseName(
      name,
      String(req.user?._id),
      String(_id)
    );
    if (!verificationResult.status)
      return response(res, 400, verificationResult.message);

    const database = await Database.findByIdAndUpdate(
      { _id },
      { name },
      { new: true }
    );
    return response(res, 200, "Database edited", database);
  } catch (error) {
    next(error);
  }
};

export const addUser = async (req: Req, res: Response, next: NextFunction) => {
  try {
    const { _id, email, privilege } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return response(res, 404, "User does not have an account with us");
    if (req.user?.email === email)
      return response(res, 400, "You are already a user of the database");
    const tokenResult = await createToken(user, "acceptInvite", 48, {
      _id,
      privilege,
    });
    if (!tokenResult.status) return response(res, 400, tokenResult.message);
    await mailer(
      user.email,
      "Database Invite",
      mailString(String(req.user?.firstname), tokenResult.data)
    );
    return response(
      res,
      200,
      "A mail has been sent to the individual to accept your invite"
    );
  } catch (error) {
    next(error);
  }
};

export const acceptInvite = async (
  req: Req,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.body;
    const date: number = new Date().getTime();
    const foundToken = await Token.findOne({
      token,
      type: "acceptInvite",
    });
    if (!foundToken) return response(res, 401, "Invalid Token");
    if (date > foundToken.expiresAt.getTime())
      return response(res, 401, "Invalid Token");
    const { _id, privilege } = foundToken.data;
    if (!_id) return response(res, 401, "Invalid Token");
    const database = await Database.findById(_id);
    if (!database) return response(res, 404, "Database does not exist");
    if (database.locked)
      return response(res, 401, "The database is inaccessible");
    const foundUser = database.users.find(
      (user) => user.user.toString() === foundToken.user.toString()
    );
    if (!foundUser)
      database.users.push({
        user: foundToken.user,
        privilege: privilege || "view",
      });
    await database.save();
    await Token.deleteMany({ user: foundToken.user, type: "acceptInvite" });
    return response(res, 200, "Youve been added to the database");
  } catch (error) {
    next(error);
  }
};

export const editUserPrivilege = async (
  req: Req,
  res: Response,
  next: NextFunction
) => {
  try {
    const { _id, userId, privilege } = req.body;
    const editResult = await editUser(_id, userId, privilege);
    if (!editResult.status) return response(res, 400, editResult.message);
    return response(res, 200, editResult.message);
  } catch (error) {
    next(error);
  }
};

export const removeUserFromDatabase = async (
  req: Req,
  res: Response,
  next: NextFunction
) => {
  try {
    const { _id, userId } = req.body;
    const removeResult = await removeUser(_id, userId, String(req.user?._id));
    if (!removeResult.status) return response(res, 400, removeResult.message);
    return response(res, 200, removeResult.message);
  } catch (error) {
    next(error);
  }
};

export const deleteDatabase = async (
  req: Req,
  res: Response,
  next: NextFunction
) => {
  try {
    const database = await Database.findById(req.params._id);
    if (!database) return response(res, 404, "Database does not exist");
    const verifyAccess = await databaseAccess(
      String(database._id),
      String(req.user?._id),
      []
    );
    if (!verifyAccess.status)
      return response(res, 401, verifyAccess.message, null);
    const existingCollection = await Collection.findOne({
      database: database._id,
    });
    if (existingCollection)
      return response(
        res,
        400,
        "Kindly delete all the database collections before deleting the database"
      );
    await Database.findByIdAndDelete(database._id);
    return response(res, 200, "Database deleted");
  } catch (error) {
    next(error);
  }
};

export const lockDatabase = async (
  req: Req,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      params: { _id, value },
      user,
    } = req;

    const database = await Database.findById(_id);
    if (!database) return response(res, 404, "Database does not exist");
    if (database.lockedByAdmin)
      return response(
        res,
        400,
        "Database is inaccesible, Contact customer care"
      );
    const verifyAccess = await databaseAccess(
      String(database._id),
      String(req.user?._id),
      []
    );
    if (!verifyAccess.status)
      return response(res, 401, verifyAccess.message, null);
    database.locked = value === "true" ? true : false;
    await database.save();
    return response(
      res,
      200,
      `Database ${database.locked ? "locked" : "unlocked"}`
    );
  } catch (error) {
    next(error);
  }
};
