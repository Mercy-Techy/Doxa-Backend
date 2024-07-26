import { Types } from "mongoose";
import { serviceReturnType, file, mongooseId, Req } from "../../types";
import { collectionField, CollectionType } from "../collection/model";
import { capitalizer } from "../../utilities/helpers";
import { DocumentType, Document } from "./model";
import { deleteFile } from "../../middleware/file-handler";

const fileTypes = ["image", "video", "document"];
const textTypes = [
  "numeric value",
  "text",
  "true/false",
  "link to another document",
];

export const dataTypeValidator = (dataType: string, value: string) => {
  let status;
  switch (dataType) {
    case "numeric value":
      const reformedValue = Number.isNaN(+value);
      status = !reformedValue;
      break;
    case "text":
      status = typeof value === "string" && value.length > 0;
      break;
    case "true/false":
      status =
        value.trim() === "true"
          ? true
          : value.trim() === "false"
          ? true
          : false;
      break;
    case "link to another document":
      status = Types.ObjectId.isValid(value);
      break;
    default:
      status = false;
  }
  return status;
};

export const validateData = (
  field: collectionField[],
  data: string[],
  files: file[] = []
): serviceReturnType => {
  const editedField = field.map((st) => st.name);
  let editedData = files.map((fl) => fl.fieldname);
  editedData = [...data, ...editedData];
  for (let item of editedData) {
    const existingInFields = editedField.find(
      (value) => value === item.toLowerCase()
    );
    if (!existingInFields)
      return {
        status: false,
        message: `${capitalizer(
          item
        )} is not a field in the collection, kindly edit your collection fields`,
        data: null,
      };
  }
  return { status: true, message: "verified", data: null };
};

export const validateExistingFields = async (
  document: DocumentType,
  collection: CollectionType,
  req: Req
): Promise<serviceReturnType> => {
  try {
    const documentData: any = [
      ...document.text.map((tx) => tx),
      ...document.files.map((fl) => fl),
    ];

    const collectionData = [...collection.fields.map((fd) => fd.name)];
    const missingItems = documentData.filter(
      (item: any) => !collectionData.includes(item.name)
    );
    const rText = [];
    const rFiles = [];

    for (let item of missingItems) {
      if (textTypes.includes(item?.dataType)) {
        const existing = req.body[item.name];
        if (existing) rText.push(item);
      }
      if (fileTypes.includes(item?.fileType)) {
        const existingInText = req.body[item.name];
        const existingInFile = req.files.find(
          (fl: file) => fl.fieldname === item.name
        );
        if (existingInFile || existingInText) rFiles.push(item);
        if (!existingInFile && !existingInText)
          await deleteFile(item.publicId, item.fileType);
      }
    }
    req.body = { ...req.body, rText, rFiles };
    return { status: true, message: "Done", data: null };
  } catch (error: any) {
    return { status: false, message: error.message, data: null };
  }
};

export const removeDocument = async (
  document: DocumentType
): Promise<serviceReturnType> => {
  try {
    if (document.ifFile) {
      for (let file of document.files) {
        await deleteFile(file.publicId, file.fileType);
      }
    }
    await Document.findByIdAndDelete(document._id);
    return {
      status: true,
      message: "Document deleted successfully",
      data: null,
    };
  } catch (error: any) {
    return { status: false, message: error.message, data: null };
  }
};
