import { Response, NextFunction } from "express";
import { Req } from "../../types";
import { User } from "../user/model";
import { Database } from "../database/model";
import response from "../../utilities/response";
import { Collection } from "../collection/model";
import { Document } from "../document/model";

export const getAllUser = async (
  req: Req,
  res: Response,
  next: NextFunction
) => {
  try {
    const doxaUsers = [];
    const users = await User.find();

    for (let user of users) {
      const userDBs = await Database.find({ creator: user._id });
      let noOfCollections = 0;
      let noOfDocuments = 0;
      for (let db of userDBs) {
        const collections = await Collection.count({ database: db._id });
        const documents = await Document.count({ database: db._id });
        noOfCollections += collections;
        noOfDocuments += documents;
      }
      doxaUsers.push({
        ...user.toObject(),
        noOfCollections,
        noOfDocuments,
        noOfDBs: userDBs.length,
      });
    }

    return response(res, 200, "Database Users", {
      users: doxaUsers,
      noOfUsers: users.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserDBDetails = async (
  req: Req,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params._id);
    if (!user) return response(res, 404, "User does not exist");
    const userDBs = await Database.find({ creator: req.params._id });
    let noOfCollections = 0;
    let noOfDocuments = 0;
    for (let db of userDBs) {
      const collections = await Collection.count({ database: db._id });
      const documents = await Document.count({ database: db._id });
      noOfCollections += collections;
      noOfDocuments += documents;
    }
    return response(res, 200, "User Database Details", {
      noOfCollections,
      noOfDocuments,
      noOfDBs: userDBs.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getDBMSState = async (
  req: Req,
  res: Response,
  next: NextFunction
) => {
  try {
    const documents = await Document.count();
    const collections = await Collection.count();
    const DBs = await Database.count();
    return response(res, 200, "DBMS State", { documents, collections, DBs });
  } catch (error) {
    next(error);
  }
};

export const blockUser = async (
  req: Req,
  res: Response,
  next: NextFunction
) => {
  try {
    const { _id, value } = req.body;
    const user = await User.findById(_id);
    if (!user) return response(res, 404, "User does not exist");
    user.deactivated = value;
    await user.save();
    const userDBs = await Database.find({ creator: _id });
    for (let db of userDBs) {
      db.locked = value;
      db.lockedByAdmin = value;
      await db.save();
    }
    return response(res, 200, "Action completed");
  } catch (error) {
    next(error);
  }
};
