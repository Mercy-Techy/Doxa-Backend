import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";

import { createUser } from "../user/service";
import { User } from "../user/model";
import response from "../../utilities/response";
import { createToken, verifyToken } from "../token/service";
import mailer from "../../service/mailer";
import { signJWT } from "../../utilities/JWT";
import { Req } from "../../types";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const creationResult = await createUser(req.body);
    if (!creationResult.status) throw creationResult.data;
    const tokenResult = await createToken(creationResult.data, "verifyEmail");
    if (!tokenResult.status) return response(res, 400, tokenResult.message);
    await mailer(
      creationResult.data.email,
      "Account Verification",
      `You registered on Doxa, Kindly use the token ${tokenResult.data} on your mobile app to verify your account creation`
    );
    return response(
      res,
      201,
      "Thanks for signing up, a token has been sent to your mail to activate you account"
    );
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, email } = req.body;
    const verifyTokenResult = await verifyToken(token, email, "verifyEmail");
    if (!verifyTokenResult.status)
      return response(res, 401, verifyTokenResult.message);
    return response(res, 200, "Your account has been activated, kindly login");
  } catch (error) {
    next(error);
  }
};

export const requestResendPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, type } = req.body;
    if (!type) return response(res, 400, "Type is required");
    const subject =
      type === "resetPassword" ? "Password Reset" : "Account Verification";
    const text =
      type === "resetPassword"
        ? "reset your password"
        : "verify your account creation";
    const user = await User.findOne({ email });
    if (!user)
      return response(res, 404, "You have no account with us, kindly sign up");
    const tokenResult = await createToken(user, type);
    if (!tokenResult.status) return response(res, 400, tokenResult.message);
    await mailer(
      email,
      subject,
      `You requested for a password reset, kindly use the token ${tokenResult.data} to ${text}`
    );
    return response(
      res,
      200,
      "A token has been sent to your mail to reset your password"
    );
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, password, email } = req.body;
    const verifyTokenResult = await verifyToken(
      token,
      email,
      "resetPassword",
      password
    );
    if (!verifyTokenResult.status)
      return response(res, 401, verifyTokenResult.message);
    return response(res, 200, "Password reset successful");
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Req,
  res: Response,
  next: NextFunction
) => {
  try {
    const { oldPassword, password } = req.body;
    const user = await User.findById(req?.user?._id);
    if (!user) return response(res, 404, "User does not exisit");
    const isPassword = bcrypt.compareSync(oldPassword, user.password);
    if (!isPassword) return response(res, 401, "Invalid Password");
    user.password = password;
    await user.save();
    return response(res, 200, "Password reset successful");
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return response(res, 401, "Invalid email address", null);
    const passwordMatches = bcrypt.compareSync(password, user.password);
    if (!passwordMatches) return response(res, 401, "Invalid Password");
    if (!user.emailVerified)
      return response(
        res,
        402,
        "Your account has not been activated, Kindly verify your mail to activate your account"
      );
    if (user.deactivated)
      return response(
        res,
        403,
        "Your account has been deactivated, kindly contact the customer care to reactivate your account"
      );
    const token = signJWT({ _id: user._id });
    await User.findByIdAndUpdate(user._id, { status: "active" });
    return response(res, 200, "Welcome to Doxa", { token, user });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Req, res: Response, next: NextFunction) => {
  try {
    await User.findByIdAndUpdate(req.user?._id, {
      status: "inactive",
      loginLast: new Date(),
    });
    return response(res, 200, "Successfully logged out");
  } catch (error) {
    next(error);
  }
};
