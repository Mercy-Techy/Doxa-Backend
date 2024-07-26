import { Router } from "express";

import {
  signup,
  verifyEmail,
  requestResendPassword,
  resetPassword,
  login,
  logout,
  changePassword,
} from "./controller";
import authenticator from "../../middleware/authenticator";
import { userValidator, passwordValidator } from "../user/validator";
import validator from "../../middleware/validator";

const router = Router();

router.post("/signup", userValidator, validator, signup);
router.post("/verify-Email", verifyEmail);
router.post("/request-resend-password", requestResendPassword);
router.post("/reset-password", passwordValidator, validator, resetPassword);
router.post(
  "/change-password",
  authenticator,
  passwordValidator,
  validator,
  changePassword
);
router.post("/login", login);
router.post("/logout", authenticator, logout);

export default router;
