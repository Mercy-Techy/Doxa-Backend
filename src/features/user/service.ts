import { User, UserType } from "./model";
import { serviceReturnType } from "../../types";

export const createUser = async (
  userDetails: UserType
): Promise<serviceReturnType> => {
  try {
    const user = await User.create(userDetails);
    return { status: true, message: "User created", data: user };
  } catch (error: any) {
    return { status: false, message: error.message, data: error };
  }
};
