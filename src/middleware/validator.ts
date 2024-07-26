import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

import response from "../utilities/response";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response(res, 422, errors.array()[0].msg);
    }
    next();
  } catch (error) {
    next(error);
  }
};
