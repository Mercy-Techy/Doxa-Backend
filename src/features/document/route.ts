import { Router } from "express";

import { parser, uploadFile } from "../../middleware/file-handler";
import {
  addDocumentValidator,
  editDocumentValidator,
} from "../../middleware/document-validator";
import { idValidator } from "../../utilities/helpers";
import validator from "../../middleware/validator";
import authenticator from "../../middleware/authenticator";

import { createDocument, editDocument, deleteDocument } from "./controller";

const router = Router();

router.post(
  "/",
  parser.any(),
  authenticator,
  idValidator("database"),
  idValidator("collectionId"),
  validator,
  addDocumentValidator,
  uploadFile,
  createDocument
);

router.put(
  "/",
  parser.any(),
  authenticator,
  idValidator("_id"),
  validator,
  editDocumentValidator,
  uploadFile,
  editDocument
);

router.delete(
  "/:_id",
  authenticator,
  idValidator("_id"),
  validator,
  deleteDocument
);

export default router;
