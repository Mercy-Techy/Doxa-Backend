import { Schema } from "mongoose";
import { Request } from "express";

import { UserType } from "../features/user/model";

export type serviceReturnType = {
  status: boolean;
  message: string;
  data: any;
};
export type mongooseId = Schema.Types.ObjectId;

export type jwtPayload = { _id: mongooseId };

export interface file {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

export interface Req extends Request {
  user?: UserType;
  files?: file[] | any;
}

export interface fieldType {
  _id: mongooseId;
  name: string;
  required: string;
  unique: string;
  dataType: string;
  data: any;
}
