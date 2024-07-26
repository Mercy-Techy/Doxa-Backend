import { Router } from "express";

import authenticator from "../../middleware/authenticator";
import validateAdmin from "../../middleware/validateAdmin";
import {
  getAllUser,
  getUserDBDetails,
  blockUser,
  getDBMSState,
} from "./controller";

const router = Router();

router.get("/users", authenticator, validateAdmin, getAllUser);
router.get("/users/:_id", authenticator, validateAdmin, getUserDBDetails);
router.get("/db-state", authenticator, validateAdmin, getDBMSState);
router.post("/block-user", authenticator, validateAdmin, blockUser);

export default router;
