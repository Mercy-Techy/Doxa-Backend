import { Request, Response, NextFunction } from "express";
import { Error } from "mongoose";

import response from "../utilities/response";

export default (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let message;
  if (error instanceof Error.ValidationError) {
    const keys = Object.keys(error.errors);
    const firstKey = keys[0];
    message = error.errors[firstKey]?.message || "Validation Error";
  } else if (error instanceof Error.CastError) {
    message = "Invalid ID";
  } else if (error.code === 11000) message = "Email is not available";
  else {
    message = error.message || "Internal Server Error";
  }

  return response(res, 400, message);
};
