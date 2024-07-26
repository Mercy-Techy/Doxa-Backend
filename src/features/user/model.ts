import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

interface avatarObject {
  publicId: string;
  url: String;
}

export interface UserType extends Document {
  _id: Schema.Types.ObjectId;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone: string;
  avatar: avatarObject;
  emailVerified: boolean;
  status: string;
  loginLast: Date;
  deactivated: boolean;
  admin: boolean;
}

const userSchema: Schema = new Schema({
  firstname: { type: String, required: true, trim: true },
  lastname: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  emailVerified: { type: Boolean, required: true, default: false },
  avatar: {
    publicId: String,
    url: String,
  },
  status: {
    type: String,
    default: "inactive",
    enum: ["active", "inactive", "suspended"],
  },
  loginLast: { type: Date },
  deactivated: { type: Boolean, required: true, default: false },
  admin: { type: Boolean, required: true, default: false },
});

userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = bcrypt.hashSync(this.password, 12);
  }
  next();
});

export const User = model<UserType>("User", userSchema);
