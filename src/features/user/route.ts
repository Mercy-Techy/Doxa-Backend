import { Router } from "express";

import {
  fetchUser,
  getUserById,
  updateProfile,
  uploadProfilePicture,
  deactivateAccount,
} from "./controller";
import authenticator from "../../middleware/authenticator";
import validator from "../../middleware/validator";
import { idValidator } from "../../utilities/helpers";
import { updateUserValidator } from "./validator";
import { parser } from "../../middleware/file-handler";

const router = Router();

router.get("/:_id", idValidator("_id"), validator, getUserById);
router.get("/", authenticator, fetchUser);
router.put("/", updateUserValidator, validator, authenticator, updateProfile);
router.post(
  "/upload",
  parser.single("image"),
  authenticator,
  uploadProfilePicture
);
router.delete("/", authenticator, deactivateAccount);

export default router;
