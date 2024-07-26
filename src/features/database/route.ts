import { Router } from "express";

import authenticator from "../../middleware/authenticator";
import validateUserAccess from "../../middleware/validate-user-access";
import {
  editPrivilegeValidator,
  databaseValidator,
  privilegeValidator,
} from "./validator";
import validator from "../../middleware/validator";
import { idValidator } from "../../utilities/helpers";
import {
  addDatabase,
  fetchDatabases,
  getDatabase,
  editDatabase,
  addUser,
  acceptInvite,
  editUserPrivilege,
  removeUserFromDatabase,
  deleteDatabase,
  lockDatabase,
} from "./controller";

const router = Router();

router.post("/", authenticator, databaseValidator, validator, addDatabase);
router.get("/", authenticator, fetchDatabases);
router.get("/:_id", authenticator, idValidator("_id"), validator, getDatabase);
router.patch(
  "/",
  authenticator,
  idValidator("_id"),
  databaseValidator,
  validator,
  validateUserAccess,
  editDatabase
);
router.post(
  "/user",
  authenticator,
  idValidator("_id"),
  validator,
  validateUserAccess,
  addUser
);
router.patch(
  "/user",
  authenticator,
  idValidator("userId"),
  validator,
  removeUserFromDatabase
);
router.post("/user/acceptInvite", acceptInvite);
router.put(
  "/user",
  authenticator,
  editPrivilegeValidator,
  validator,
  validateUserAccess,
  editUserPrivilege
);

router.delete(
  "/:_id",
  authenticator,
  idValidator("_id"),
  validator,
  deleteDatabase
);

router.post(
  "/:_id/:value",
  authenticator,
  idValidator("_id"),
  validator,
  lockDatabase
);
export default router;
