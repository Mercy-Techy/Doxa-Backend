import { Response, NextFunction } from "express";

import { Req, file } from "../types";
import { Collection } from "../features/collection/model";
import { Document } from "../features/document/model";
import response from "../utilities/response";
import { capitalizer } from "../utilities/helpers";
import { databaseAccess } from "../features/database/service";
import {
  validateData,
  dataTypeValidator,
  validateExistingFields,
} from "../features/document/service";
import { deleteFile } from "./file-handler";

const fileTypes = ["image", "video", "document"];
const textTypes = [
  "numeric value",
  "text",
  "true/false",
  "link to another document",
];

export const addDocumentValidator = async (
  req: Req,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      body: { collectionId, database, ...otherItems },
      files,
    } = req;

    const verifyAccess = await databaseAccess(
      String(database),
      String(req.user?._id),
      ["edit-content", "edit-structure"]
    );
    if (!verifyAccess.status)
      return response(res, 401, verifyAccess.message, null);

    const existingCollection = await Collection.findOne({
      _id: collectionId,
      database,
    });
    if (!existingCollection)
      return response(res, 404, "Collection does not exist");

    const verifiedData = validateData(
      existingCollection.fields,
      Object.keys(otherItems),
      files
    );
    if (!verifiedData.status) return response(res, 400, verifiedData.message);

    const documentText = [];
    const documentFiles = [];
    for (let {
      name,
      required,
      unique,
      dataType,
      data,
    } of existingCollection.fields) {
      let dataStore = {};
      if (textTypes.includes(dataType)) {
        const existingField = otherItems[name];
        if (!existingField && required)
          return response(res, 422, `${capitalizer(name)} has no value`);
        if (!existingField && !required) continue;

        const isVerified = dataTypeValidator(dataType, existingField);
        if (!isVerified)
          return response(
            res,
            422,
            `Invalid data type for ${name}, data type '${dataType}' was specified in the collection structure`
          );

        if (unique) {
          const existingDocument = await Document.findOne({
            database,
            collectionId,
            text: {
              $elemMatch: {
                name,
                value:
                  dataType === "text"
                    ? existingField.trim().toLowerCase()
                    : dataType === "numeric value"
                    ? +existingField
                    : dataType === "true/false" &&
                      existingField.trim() === "true"
                    ? true
                    : dataType === "true/false" &&
                      existingField.trim() === "false"
                    ? false
                    : existingField,
              },
            },
          });
          if (existingDocument)
            return response(
              res,
              422,
              `${existingField} under the field '${name}' already exists`
            );
        }

        if (dataType === "link to another document") {
          if (String(existingCollection._id) === String(data.collectionId))
            return response(
              res,
              400,
              "Linked document cannot be in the same collection"
            );
          const linkedDocument = await Document.findOne({
            _id: existingField,
            collectionId: data.collectionId,
            database,
          });
          if (!linkedDocument)
            return response(res, 404, "Linked document does not exist");
          dataStore = { ...dataStore, linkedDocument };
        }

        documentText.push({
          name,
          value: existingField,
          dataType,
          data: dataStore,
        });
      }
      if (fileTypes.includes(dataType)) {
        const existingFile = files?.find(
          ({ fieldname }: file) => fieldname === name
        );
        if (!existingFile && required)
          return response(res, 422, `${capitalizer(name)} was not uploaded`);
        if (!existingFile && !required) continue;
        if (dataType !== "document") {
          if (existingFile.mimetype.split("/")[0] !== dataType)
            return response(
              res,
              422,
              `${capitalizer(name)} is of data type ${dataType}`
            );
        } else {
          if (
            existingFile.mimetype?.includes("image") ||
            existingFile.mimetype?.includes("video")
          ) {
            return response(
              res,
              422,
              `${capitalizer(name)} is of data type ${dataType}`
            );
          }
        }
        documentFiles.push({ ...existingFile, dataType });
      }
    }
    req.body = { ...req.body, documentText, documentFiles };
    next();
  } catch (error) {
    next(error);
  }
};

export const editDocumentValidator = async (
  req: Req,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      body: { _id, ...otherItems },
      files,
    } = req;
    const document = await Document.findById(_id);
    if (!document) return response(res, 404, "Document does not exist");
    const collectionId = document.collectionId;
    const database = document.database;

    const verifyAccess = await databaseAccess(
      String(database),
      String(req.user?._id),
      ["edit-content", "edit-structure"]
    );
    if (!verifyAccess.status)
      return response(res, 401, verifyAccess.message, null);

    const existingCollection = await Collection.findOne({
      _id: collectionId,
      database,
    });
    if (!existingCollection)
      return response(res, 404, "Collection does not exist");

    const validationResult = await validateExistingFields(
      document,
      existingCollection,
      req
    );
    if (!validationResult.status)
      return response(res, 400, validationResult.message);

    const documentText = [];
    const documentFiles = [];
    const savedFiles = [];
    for (let {
      name,
      required,
      unique,
      dataType,
      data,
    } of existingCollection.fields) {
      let dataStore = {};
      if (textTypes.includes(dataType)) {
        const existingField = otherItems[name];
        if (!existingField && required)
          return response(res, 422, `${capitalizer(name)} has no value`);
        if (!existingField && !required) continue;

        const isVerified = dataTypeValidator(dataType, existingField);
        if (!isVerified)
          return response(
            res,
            422,
            `Invalid data type for ${name}, data type '${dataType}' was specified in the collection structure`
          );

        if (unique) {
          const existingDocument = await Document.findOne({
            database,
            collectionId,
            text: {
              $elemMatch: {
                name,
                value:
                  dataType === "text"
                    ? existingField.trim().toLowerCase()
                    : dataType === "numeric value"
                    ? +existingField
                    : dataType === "true/false" &&
                      existingField.trim() === "true"
                    ? true
                    : dataType === "true/false" &&
                      existingField.trim() === "false"
                    ? false
                    : existingField,
              },
            },
          });
          if (
            existingDocument &&
            String(document._id) !== String(existingDocument._id)
          )
            return response(
              res,
              422,
              `${existingField} under the field '${name}' already exists`
            );
        }

        if (dataType === "link to another document") {
          if (String(existingCollection._id) === String(data.collectionId))
            return response(
              res,
              400,
              "Linked document cannot be in the same collection"
            );
          const linkedDocument = await Document.findOne({
            _id: existingField,
            collectionId: data.collectionId,
            database,
          });
          if (!linkedDocument)
            return response(res, 404, "Linked document does not exist");
          dataStore = { ...dataStore, linkedDocument };
        }

        documentText.push({
          name,
          value: existingField,
          dataType,
          data: dataStore,
        });
      }
      if (fileTypes.includes(dataType)) {
        let existingFile: any = files?.find((fl: file) => fl.fieldname == name);
        if (!existingFile && !otherItems[name] && required)
          return response(res, 422, `${capitalizer(name)} was not uploaded`);
        if (!existingFile && !otherItems[name] && !required) {
          const fl = document.files.find((fl) => fl.name === name);
          fl ? await deleteFile(fl.publicId, fl.fileType) : "";
          continue;
        }
        if (existingFile) {
          const fl = document.files.find(
            (fl) => fl.name === existingFile.fieldname
          );
          fl ? await deleteFile(fl.publicId, fl.fileType) : "";
          documentFiles.push(existingFile);
        }
        if (otherItems[name]) {
          const fl = document.files.find((fl) => fl.name === name);
          fl ? savedFiles.push(fl) : "";
        }
      }
    }
    req.body = {
      ...req.body,
      documentText: [...documentText, ...req.body.rText],
      savedFiles: [...savedFiles, ...req.body.rFiles],
      documentFiles,
    };
    next();
  } catch (error) {
    next(error);
  }
};
