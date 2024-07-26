import { body } from "express-validator";

export const collectionValidator = [
  body("name", "Collection name is required")
    .trim()
    .notEmpty()
    .isString()
    .isLength({ min: 3, max: 30 })
    .withMessage(
      "The length of the collection name should fall between 3 and 15"
    )
    .toLowerCase(),
  body("database", "Databse Identifier is required").trim().isMongoId(),
  body("fields", "Collection Fields must be declared").isArray({ min: 1 }),
  body("fields.*.name", "Collection field name is required")
    .trim()
    .notEmpty()
    .isString()
    .isLength({ min: 3, max: 30 })
    .withMessage("The length of the field name should fall between 3 and 15")
    .toLowerCase()
    .custom((value, { req }) => {
      const foundField = req.body.fields.filter(
        (field: any) => field.name.toLowerCase() === value
      );
      if (foundField.length > 1) {
        throw new Error("Field names must be unique ");
      }
      return true;
    }),
  body("fields.*.required", "Kindly state if field is required")
    .optional()
    .trim()
    .isBoolean(),
  body("fields.*.unique", "Kindly state if field values are unique")
    .optional()
    .trim()
    .isBoolean(),
  body("fields.*.dataType", "Kindly select the field's data type")
    .trim()
    .notEmpty()
    .toLowerCase()
    .isIn([
      "numeric value",
      "text",
      "true/false",
      "image",
      "video",
      "document",
      "link to another document",
    ])
    .withMessage("Invalid data type"),
  body("fields.*.data.collectionId", "Linked collection identifier is required")
    .optional()
    .isMongoId(),
];
