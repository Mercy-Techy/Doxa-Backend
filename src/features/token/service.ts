import rs from "randomstring";

import { UserType, User } from "../user/model";
import Token from "./model";
import { serviceReturnType } from "../../types";

const generateToken = async (): Promise<serviceReturnType> => {
  try {
    const options = {
      charset: "numeric",
      length: 6,
    };
    let token, checkToken;
    do {
      token = rs.generate(options);
      checkToken = await Token.findOne({ token });
    } while (checkToken);
    return { status: true, message: "Token Generated", data: token };
  } catch (error: any) {
    return { status: false, message: error.message, data: error };
  }
};

export const createToken = async (
  user: UserType,
  type: string,
  hours: number = 1,
  data: any = {}
): Promise<serviceReturnType> => {
  try {
    const token = await generateToken();
    await Token.deleteMany({ user: user._id, type });
    await Token.create({
      user,
      type,
      token: token.data,
      expiresAt: new Date().getTime() + hours * 60 * 60 * 1000,
      data,
    });
    return { status: true, message: "Token Created", data: token.data };
  } catch (error: any) {
    return { status: false, message: error.message, data: error };
  }
};

export const verifyToken = async (
  token: string,
  email: string,
  type: string,
  password = null
): Promise<serviceReturnType> => {
  try {
    const date: number = new Date().getTime();
    const user = await User.findOne({ email });
    if (!user) return { status: false, message: "Invalid Token", data: null };
    const foundToken = await Token.findOne({
      user: user._id,
      token,
      type,
    });
    if (!foundToken)
      return { status: false, message: "Invalid Token", data: null };
    if (date > foundToken.expiresAt.getTime())
      return { status: false, message: "Expired Token", data: null };
    await Token.deleteMany({ user: user._id, type });
    type === "verifyEmail"
      ? (user.emailVerified = true)
      : type === "resetPassword" && password !== null
      ? (user.password = password)
      : "";
    await user.save();
    return { status: true, message: "Token Verified", data: user };
  } catch (error: any) {
    return { status: false, message: error.message, data: error };
  }
};
