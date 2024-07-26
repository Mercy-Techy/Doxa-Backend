import { Response, NextFunction } from "express";

import { Req } from "../types";
import response from "../utilities/response";
import { databaseAccess } from "../features/database/service";

export default async (req: Req, res: Response, next: NextFunction) => {
  try {
    const databaseId = req.body.database || req.body._id;
    const validationResult = await databaseAccess(
      String(databaseId),
      String(req.user?._id),
      ["edit-structure"]
    );
    if (!validationResult.status)
      return response(res, 401, validationResult.message);

    next();
  } catch (error) {
    next(error);
  }
};
