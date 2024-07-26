import mongoose, { Schema, Types, model } from "mongoose";

export interface textData {
  name: string;
  value: any;
  dataType: string;
  data: any;
}

export interface fileData {
  name: string;
  publicId: string;
  url: string;
  fileType: string;
}

export interface DocumentType extends mongoose.Document {
  collectionId: Types.ObjectId | Record<string, unknown>;
  database: Types.ObjectId;
  creator: Types.ObjectId;
  ifFile: boolean;
  text: textData[];
  files: fileData[];
  isOnEdit: boolean;
}

const documentSchema: Schema = new Schema(
  {
    collectionId: { type: Types.ObjectId, ref: "Collection" },
    database: { type: Types.ObjectId, ref: "Database" },
    creator: { type: Types.ObjectId, ref: "User" },
    text: [
      {
        name: String,
        value: Schema.Types.Mixed,
        dataType: String,
        data: Schema.Types.Mixed,
      },
    ],
    ifFile: { type: Boolean, required: true, default: false },
    files: [{ name: String, publicId: String, url: String, fileType: String }],
    isOnEdit: { type: Boolean, default: false },
  },
  { timestamps: true }
);

documentSchema.pre("save", function (next) {
  if (this.isModified("text")) {
    const updatedText = this.text.map((tx: textData) => {
      if (tx.dataType === "numeric value") {
        return { ...tx, value: +tx.value };
      }
      if (tx.dataType === "true/false") {
        const newValue =
          tx.value.trim() === "true"
            ? true
            : tx.value.trim() === "false"
            ? false
            : "";
        return { ...tx, value: newValue };
      }
      if (tx.dataType === "text") {
        return { ...tx, value: tx.value?.trim()?.toLowerCase() };
      }
      return tx;
    });
    this.text = [...updatedText];
  }
  next();
});

export const Document = model<DocumentType>("Document", documentSchema);
