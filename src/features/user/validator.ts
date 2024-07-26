import { body } from "express-validator";

export const passwordValidator = [
  body("password", "Password is required")
    .trim()
    .notEmpty()
    .isStrongPassword()
    .withMessage(
      "Password must be at least 8 characters including a lowercase letter, an uppercase letter,a special symbol and a number"
    ),
];

export const userValidator = [
  body("firstname", "Firstname is required")
    .trim()
    .notEmpty()
    .isString()
    .toLowerCase(),
  body("lastname", "Lastname is required")
    .trim()
    .notEmpty()
    .isString()
    .toLowerCase(),
  body("email", "Email is required")
    .trim()
    .isEmail()
    .withMessage("Email address is invalid"),
  body("phone", "Phone number is required")
    .trim()
    .isMobilePhone("en-NG")
    .withMessage("Invalid phone number"),
  ...passwordValidator,
];

export const updateUserValidator = [
  body("firstname", "Firstname is required")
    .trim()
    .notEmpty()
    .isString()
    .toLowerCase(),
  body("lastname", "Lastname is required")
    .trim()
    .notEmpty()
    .isString()
    .toLowerCase(),
  body("phone", "Phone number is required")
    .trim()
    .isMobilePhone("en-NG")
    .withMessage("Invalid phone number"),
];
