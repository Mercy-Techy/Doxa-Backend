import cloudinary from "cloudinary";
import { Response, NextFunction } from "express";
import multer from "multer";

import { Req } from "../types";
import { serviceReturnType } from "../types";

const { config, uploader } = cloudinary.v2;

config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const parser = multer({ storage: multer.diskStorage({}) });
//add size validator

export const fileUploader = async (
  path: string
): Promise<serviceReturnType> => {
  try {
    const data = await uploader.upload(path, {
      resource_type: "auto",
      folder: "Doxa",
    });
    return { status: true, message: "Uploaded", data };
  } catch (error: any) {
    return { status: false, message: error.message, data: error };
  }
};

export const uploadFile = async (
  req: Req,
  res: Response,
  next: NextFunction
) => {
  try {
    const { documentFiles, ...otherItems } = req.body;
    const uploadedFiles = [];
    if (documentFiles.length > 0) {
      for (let { path, fieldname, dataType } of documentFiles) {
        const { status, data } = await fileUploader(path);
        if (!status) continue;
        uploadedFiles.push({
          name: fieldname,
          publicId: data?.public_id,
          url: data?.url,
          fileType: dataType,
        });
      }
      req.body = { ...otherItems, uploadedFiles };
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const deleteFile = async (
  publicId: string,
  fileType: string
): Promise<serviceReturnType> => {
  try {
    await uploader.destroy(publicId, {
      resource_type: fileType === "document" ? "raw" : fileType,
    });
    return { status: true, message: "File deleted", data: null };
  } catch (error: any) {
    return { status: false, message: error.message, data: null };
  }
};
