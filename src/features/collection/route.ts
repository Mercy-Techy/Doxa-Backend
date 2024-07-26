import { Router } from "express";

import {
  createCollection,
  fetchCollection,
  fetchCollectionDetails,
  editCollection,
  deleteCollection,
} from "./controller";
import { collectionValidator } from "./validator";
import validator from "../../middleware/validator";
import { idValidator } from "../../utilities/helpers";
import authenticator from "../../middleware/authenticator";
import validateUserAccess from "../../middleware/validate-user-access";

const router = Router();

router.post(
  "/",
  authenticator,
  collectionValidator,
  validator,
  validateUserAccess,
  createCollection
);

router.get(
  "/:_id/:database",
  authenticator,
  idValidator("_id"),
  idValidator("database"),
  validator,
  fetchCollection
);

router.get(
  "/details/:_id/:database",
  authenticator,
  idValidator("_id"),
  idValidator("database"),
  validator,
  fetchCollectionDetails
);

router.put(
  "/",
  authenticator,
  idValidator("_id"),
  collectionValidator,
  validator,
  validateUserAccess,
  editCollection
);

router.delete(
  "/:_id",
  authenticator,
  idValidator("_id"),
  validator,
  deleteCollection
);
export default router;
