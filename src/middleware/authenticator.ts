import { Response, NextFunction } from "express";

import { User } from "../features/user/model";
import { decodeJWT } from "../utilities/JWT";
import response from "../utilities/response";
import { Req } from "../types";

export default async (req: Req, res: Response, next: NextFunction) => {
  try {
    if (req.headers && req.headers?.authorization) {
      const token = req.headers.authorization.split(" ");
      if (token.length !== 2 || token[0] !== "Bearer")
        return response(res, 401, "Action cannot be completed");
      const decoded = decodeJWT(token[1]);
      if (!decoded._id) return response(res, 401, "Invalid token");
      const user = await User.findById(decoded._id);
      if (!user) return response(res, 401, "Invalid token");
      req.user = user;
      next();
    } else {
      return response(res, 401, "Authorization header is missing");
    }
  } catch (error) {
    next(error);
  }
};
