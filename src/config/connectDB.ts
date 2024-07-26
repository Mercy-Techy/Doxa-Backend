import mongoose from "mongoose";

export default async () => {
  try {
    const url: string = String(process.env.MONGOOSE_URI);
    await mongoose.connect(url);
  } catch (error) {
    console.log(error);
  }
};
