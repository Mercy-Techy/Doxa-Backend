import { body } from "express-validator";
import { idValidator } from "../../utilities/helpers";

export const databaseValidator = [
  body("name", "Database name is required")
    .trim()
    .notEmpty()
    .isString()
    .isLength({ min: 3, max: 50 })
    .withMessage("The length of the database name should fall between 3 and 50")
    .toLowerCase(),
];

export const privilegeValidator = [
  body("privilege", "Privilege is required")
    .trim()
    .isIn(["view", "edit-content", "edit-structure"])
    .withMessage("Invalid privilege"),
];

export const editPrivilegeValidator = [
  ...idValidator("userId"),
  ...idValidator("_id"),
  ...privilegeValidator,
];
