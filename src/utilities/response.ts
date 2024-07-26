import { Response } from "express";

export default (
  res: Response,
  status: number,
  message: string,
  data: any = null
) => {
  return res.status(status).json({ message, data: data || null });
};
