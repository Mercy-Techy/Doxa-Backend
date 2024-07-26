import { mongooseId } from "../../types";

import { Database } from "../database/model";
import { Collection } from "./model";
import { serviceReturnType } from "../../types";

export const verifyCollectionName = async (
  database: mongooseId,
  name: string,
  _id: string | undefined = undefined
): Promise<serviceReturnType> => {
  try {
    const collection = await Collection.findOne({ name, database });
    if (collection && String(collection._id) !== _id)
      return { status: false, message: `${name} is not available`, data: null };
    return { status: true, message: `${name} is available`, data: null };
  } catch (error: any) {
    return { status: false, message: error.message, data: error };
  }
};
