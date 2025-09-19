import { Response, NextFunction, Request } from "express";
import { Req } from "../../types";
import { User } from "../user/model";
import { Database } from "../database/model";
import response from "../../utilities/response";
import { Collection } from "../collection/model";
import { Document } from "../document/model";

export const getAllUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = +(req.query.limit || 10);
    const page = +(req.query.page || 1);

    const usersWithStats = await User.aggregate([
      // Lookup Databases created by the user
      {
        $lookup: {
          from: "databases", // name of the Database collection
          localField: "_id",
          foreignField: "creator",
          as: "databases",
        },
      },
      // Add counts for collections and documents
      {
        $addFields: {
          noOfDBs: { $size: "$databases" },
        },
      },
      // Lookup Collections for all user databases
      {
        $lookup: {
          from: "collections",
          let: { dbIds: "$databases._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$database", "$$dbIds"],
                },
              },
            },
          ],
          as: "allCollections",
        },
      },
      {
        $addFields: {
          noOfCollections: { $size: "$allCollections" },
        },
      },
      // Lookup Documents for all user databases
      {
        $lookup: {
          from: "documents",
          let: { dbIds: "$databases._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$database", "$$dbIds"],
                },
              },
            },
          ],
          as: "allDocuments",
        },
      },
      {
        $addFields: {
          noOfDocuments: { $size: "$allDocuments" },
        },
      },
      // Remove large arrays to keep response light
      {
        $project: {
          password: 0,
          databases: 0,
          allCollections: 0,
          allDocuments: 0,
        },
      },
      // Pagination
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);

    // Total count for pagination
    const totalItems = await User.countDocuments();

    return response(res, 200, "User", {
      data: usersWithStats,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
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
      const collections = await Collection.countDocuments({ database: db._id });
      const documents = await Document.countDocuments({ database: db._id });
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
    const documents = await Document.countDocuments();
    const collections = await Collection.countDocuments();
    const DBs = await Database.countDocuments();
    const users = await User.countDocuments();
    return response(res, 200, "DBMS State", {
      documents,
      collections,
      DBs,
      users,
    });
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

export const fetchDatabases = async (
  req: Req,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = +(req.query.page || 1);
    const limit = +(req.query.limit || 10);
    const skip = (page - 1) * limit;

    const result = await Database.aggregate([
      {
        $lookup: {
          from: "collections",
          localField: "_id",
          foreignField: "database",
          as: "collections",
        },
      },
      {
        $lookup: {
          from: "documents",
          localField: "_id",
          foreignField: "database",
          as: "documents",
        },
      },
      {
        $addFields: {
          collections: { $size: "$collections" },
          documents: { $size: "$documents" },
        },
      },
      {
        $unwind: {
          path: "$users",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "users.user",
          foreignField: "_id",
          as: "users.userInfo",
        },
      },
      {
        $unwind: {
          path: "$users.userInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          "users.user": {
            _id: "$users.userInfo._id",
            firstname: "$users.userInfo.firstname",
            lastname: "$users.userInfo.lastname",
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          creator: { $first: "$creator" },
          locked: { $first: "$locked" },
          lockedByAdmin: { $first: "$lockedByAdmin" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          collections: { $first: "$collections" },
          documents: { $first: "$documents" },
          users: { $push: "$users" },
        },
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: "totalItems" }],
        },
      },
    ]);

    const { data, totalCount } = result[0] || {
      data: [],
      totalCount: [{ totalItems: 0 }],
    };

    const totalItems = totalCount[0]?.totalItems || 0;
    const totalPages = Math.ceil(totalItems / limit);

    return response(res, 200, "Databases", { data, totalItems, totalPages });
  } catch (error) {
    next(error);
  }
};

export const lockDB = async (req: Req, res: Response, next: NextFunction) => {
  try {
    const { id, value } = req.body;
    await Database.findByIdAndUpdate(id, {
      lockedByAdmin: value,
    });
    return response(res, 200, "Action completed");
  } catch (error) {
    next(error);
  }
};
