import { Response, NextFunction } from "express";

import { Req } from "../../types";
import response from "../../utilities/response";
import { Collection } from "./model";
import { verifyCollectionName } from "./service";
import { databaseAccess } from "../database/service";
import { Database } from "../database/model";
import { fieldType } from "../../types";
import { Document } from "../document/model";
import { removeDocument } from "../document/service";

export const createCollection = async (
  req: Req,
  res: Response,
  next: NextFunction
) => {
  try {
    const verificationResult = await verifyCollectionName(
      req.body.database,
      req.body.name
    );
    if (!verificationResult.status)
      return response(res, 400, verificationResult.message);
    const collection = await Collection.create({
      ...req.body,
      creator: req.user?._id,
    });
    return response(res, 201, "Collection created", collection);
  } catch (error) {
    next(error);
  }
};

export const fetchCollection = async (
  req: Req,
  res: Response,
  next: NextFunction
) => {
  try {
    const { database, _id } = req.params;

    const verifyAccess = await databaseAccess(
      String(database),
      String(req.user?._id),
      ["view", "edit-content", "edit-structure"]
    );
    if (!verifyAccess.status)
      return response(res, 401, verifyAccess.message, null);

    const collection = await Collection.findOne({ _id, database });
    if (!collection) return response(res, 404, "Collection does not exist");

    const documents = await Document.find({ collectionId: collection._id });

    return response(res, 200, "Collection", documents);
  } catch (error) {
    next(error);
  }
};

export const fetchCollectionDetails = async (
  req: Req,
  res: Response,
  next: NextFunction
) => {
  try {
    const { database, _id } = req.params;

    const verifyAccess = await databaseAccess(
      String(database),
      String(req.user?._id),
      ["view", "edit-content", "edit-structure"]
    );
    if (!verifyAccess.status)
      return response(res, 401, verifyAccess.message, null);

    const collection = await Collection.findOne({ _id, database });
    if (!collection) return response(res, 404, "Collection does not exist");

    return response(res, 200, "Collection", collection);
  } catch (error) {
    next(error);
  }
};

export const editCollection = async (
  req: Req,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, database, _id, fields } = req.body;
    const verificationResult = await verifyCollectionName(
      database,
      name,
      String(_id)
    );
    if (!verificationResult.status)
      return response(res, 400, verificationResult.message);

    const newFields = fields.map(
      ({ _id, ...otherAttributes }: fieldType) => otherAttributes
    );

    const collection = await Collection.findOneAndUpdate(
      { _id, database },
      { name, fields: newFields },
      { new: true }
    );
    if (!collection) return response(res, 404, "Collection does not exist");
    return response(res, 200, "Database edited", collection);
  } catch (error) {
    next(error);
  }
};

export const deleteCollection = async (
  req: Req,
  res: Response,
  next: NextFunction
) => {
  try {
    const collection = await Collection.findById(req.params._id);
    if (!collection) return response(res, 404, "Collection does not exist");

    const verifyAccess = await databaseAccess(
      String(collection.database),
      String(req.user?._id),
      []
    );
    if (!verifyAccess.status)
      return response(res, 401, verifyAccess.message, null);

    const documents = await Document.find({
      collectionId: collection._id,
      database: collection.database,
    });
    for (let document of documents) {
      const removalResult = await removeDocument(document);
      if (!removalResult.status)
        return response(res, 400, removalResult.message);
    }
    await Collection.findByIdAndDelete(collection._id);
    response(res, 200, "Collection deleted");
  } catch (error) {
    next(error);
  }
};
