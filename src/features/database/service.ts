import { Database } from "./model";
import { serviceReturnType, mongooseId } from "../../types";

export const verifyDatabaseName = async (
  name: string,
  creator: string,
  _id: string | undefined = undefined
): Promise<serviceReturnType> => {
  try {
    const database = await Database.findOne({ name, creator });
    if (database && String(database._id) !== _id)
      return { status: false, message: `${name} is not available`, data: null };
    return { status: true, message: `${name} is available`, data: null };
  } catch (error: any) {
    return { status: false, message: error.message, data: error };
  }
};

export const mailString = (creator: string, token: string) => {
  return `
        ${creator} added you to their database, Kindly click the link below to accept the invite
        <a href="${process.env.BASEURL}/invite/${token}">Accept</a>
    `;
};

export const editUser = async (
  _id: mongooseId,
  userId: mongooseId,
  privilege: string
): Promise<serviceReturnType> => {
  try {
    const database = await Database.findById(_id);
    if (!database)
      return { status: false, message: "Database does not exist", data: null };
    const dbUser = database.users.find(
      (user) => String(user.user) === String(userId)
    );
    const dbUserIndex = database.users.findIndex(
      (user) => String(user.user) === String(userId)
    );
    if (!dbUser)
      return {
        status: false,
        message: "User has not been added to your database",
        data: null,
      };
    database.users[dbUserIndex] = { user: dbUser.user, privilege };
    await database.save();
    return {
      status: true,
      message: "User privilege edited",
      data: null,
    };
  } catch (error: any) {
    return { status: false, message: error.message, data: error };
  }
};

export const databaseAccess = async (
  databaseId: string,
  userId: string,
  privileges: string[]
): Promise<serviceReturnType> => {
  try {
    const database = await Database.findById(databaseId);
    if (!database)
      return { status: false, message: "Database does not exist", data: null };
    if (database.locked)
      return {
        status: false,
        message: "The database is inaccessible",
        data: null,
      };
    const ifCreator: boolean =
      userId !== String(database.creator) ? false : true;
    let ifAuthorizedUser;
    for (let pr of privileges) {
      ifAuthorizedUser = database.users.find(
        ({ user, privilege }) => userId === String(user) && privilege === pr
      );
      if (ifAuthorizedUser) break;
    }
    if (!ifCreator && !ifAuthorizedUser)
      return {
        status: false,
        message: "You are not authorized to carry out this action",
        data: null,
      };
    return {
      status: true,
      message: "You are authorized to carry out this action",
      data: null,
    };
  } catch (error: any) {
    return { status: false, message: error.message, data: error };
  }
};

export const removeUser = async (
  _id: mongooseId,
  userId: mongooseId,
  removerId: string
): Promise<serviceReturnType> => {
  try {
    const database = await Database.findById(_id);
    if (!database)
      return { status: false, message: "Database does not exist", data: null };
    if (database.locked)
      return {
        status: false,
        message: "The database is inaccessible",
        data: null,
      };

    const dbUser = database.users.find(
      (user) => String(user.user) === removerId
    );

    const ifIsCreator = String(database.creator) === String(userId);
    if (ifIsCreator) {
      return {
        status: false,
        message: "User cannot be removed",
        data: null,
      };
    }

    const ifCreator = String(database.creator) === removerId;
    const ifAuthorized = dbUser?.privilege === "edit-structure";

    if (!ifCreator && !ifAuthorized && removerId !== String(userId)) {
      return {
        status: false,
        message: "You are not authorized to carry out this action",
        data: null,
      };
    }

    const updatedDbArray = database.users.filter(
      (user) => String(user.user) !== String(userId)
    );
    database.users = updatedDbArray;
    await database.save();

    return {
      status: true,
      message: "User removed",
      data: null,
    };
  } catch (error: any) {
    return { status: false, message: error.message, data: error };
  }
};
