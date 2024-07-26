import { Schema, Types, model, Document } from "mongoose";

interface DatabaseUsers {
  user: Types.ObjectId;
  privilege: string;
}

export interface DatabaseType extends Document {
  name: string;
  creator: Types.ObjectId;
  users: DatabaseUsers[];
  locked: boolean;
  lockedByAdmin: boolean;
}

const databaseSchema: Schema = new Schema(
  {
    name: { required: true, type: String, trim: true },
    creator: { type: Types.ObjectId, ref: "User" },
    users: [
      {
        user: { type: Types.ObjectId, ref: "User" },
        privilege: {
          type: String,
          enum: ["view", "edit-content", "edit-structure"],
          default: "view",
        },
      },
    ],
    locked: { type: Boolean, required: true, default: false },
    lockedByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Database = model<DatabaseType>("Database", databaseSchema);
