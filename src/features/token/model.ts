import { Schema, model } from "mongoose";

const tokenSchema: Schema = new Schema(
  {
    token: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true },
    data: { type: Schema.Types.Mixed, required: false },
    type: {
      type: String,
      enum: ["verifyEmail", "resetPassword", "acceptInvite"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Token = model("Token", tokenSchema);
export default Token;
