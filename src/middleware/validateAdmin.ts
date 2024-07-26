import { Response, NextFunction } from "express";

import { Req } from "../types";
import response from "../utilities/response";

export default async (req: Req, res: Response, next: NextFunction) => {
  try {
    const { user } = req;
    if (!user || !user?.admin)
      return response(res, 401, "Not authorized to complete action");
    next();
  } catch (error) {
    next(error);
  }
};
