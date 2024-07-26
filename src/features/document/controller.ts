import { Response, NextFunction } from "express";

import { Req } from "../../types";
import response from "../../utilities/response";
import { Document, fileData, textData } from "./model";
import { deleteFile } from "../../middleware/file-handler";
import { databaseAccess } from "../database/service";
import { removeDocument } from "./service";
import { Collection, collectionField } from "../collection/model";

export const createDocument = async (
  req: Req,
  res: Response,
  next: NextFunction
) => {
  try {
    const { documentText, uploadedFiles, ...otherItems } = req.body;
    const ifFile = uploadedFiles?.length > 0;
    const document = await Document.create({
      ...otherItems,
      ifFile,
      text: documentText || [],
      files: uploadedFiles || [],
      creator: req.user?._id,
    });
    return response(res, 201, "Document successfully created", document);
  } catch (error) {
    next(error);
  }
};

export const editDocument = async (
  req: Req,
  res: Response,
  next: NextFunction
) => {
  try {
    const { documentText, uploadedFiles, savedFiles, _id } = req.body;
    const document = await Document.findById(_id);
    if (!document) return response(res, 404, "Document does not exist");

    const collection = await Collection.findById(document.collectionId);
    if (!collection) return response(res, 404, "Collection does not exist");
    const files =
      uploadedFiles?.length > 0 && savedFiles?.length > 0
        ? [...savedFiles, ...uploadedFiles]
        : savedFiles?.length > 0 && !uploadedFiles?.length
        ? savedFiles
        : uploadedFiles?.length > 0 && !savedFiles?.length
        ? uploadedFiles
        : [];
    const ifFile = files?.length > 0;

    document.text = documentText;
    document.files = files;
    document.ifFile = ifFile;
    await document.save();

    return response(res, 200, "Document edited");
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (
  req: Req,
  res: Response,
  next: NextFunction
) => {
  try {
    const document = await Document.findById(req.params._id);
    if (!document) return response(res, 404, "Document does not exist");

    const verifyAccess = await databaseAccess(
      String(document.database),
      String(req.user?._id),
      ["edit-content", "edit-structure"]
    );
    if (!verifyAccess.status)
      return response(res, 401, verifyAccess.message, null);

    const removalResult = await removeDocument(document);
    if (!removalResult.status) return response(res, 400, removalResult.message);

    return response(res, 200, removalResult.message);
  } catch (error) {
    next(error);
  }
};
