import { check } from "express-validator";

export const idValidator = (text: string) => {
  const newText = text.replace(/id/i, "") + " ";
  return [
    check(text, `Invalid ${text === "_id" ? "" : newText}identifier`)
      .trim()
      .isMongoId(),
  ];
};

export const capitalizer = (text: string) => {
  return text[0].toUpperCase() + text.substring(1);
};
