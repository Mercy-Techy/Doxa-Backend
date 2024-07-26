import { Schema, Types, model, Document } from "mongoose";

export interface collectionField {
  name: string;
  required: boolean;
  unique: boolean;
  dataType: string;
  data?: any;
}

export interface CollectionType extends Document {
  name: string;
  creator: Types.ObjectId;
  database: Types.ObjectId;
  fields: collectionField[];
}

const collectionSchema: Schema = new Schema(
  {
    name: { required: true, type: String, trim: true },
    creator: { type: Types.ObjectId, ref: "User" },
    database: { type: Types.ObjectId, ref: "Database" },
    fields: [
      {
        name: { type: String, required: true, trim: true },
        required: { type: Boolean, required: true, default: false },
        unique: { type: Boolean, required: true, default: false },
        dataType: {
          type: String,
          enum: [
            "numeric value",
            "text",
            "true/false",
            "image",
            "video",
            "document",
            "link to another document",
          ],
          default: "text",
        },
        data: Schema.Types.Mixed,
      },
    ],
    isOnEdit: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Collection = model<CollectionType>("Collection", collectionSchema);
