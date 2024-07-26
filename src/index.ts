import express, { Application, Request, Response, json } from "express";
import cors from "cors";

import routes from "./routes";
import connectDB from "./config/connectDB";
import errorHandler from "./middleware/error-handler";

const app: Application = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(json());
connectDB().catch((err) => console.log(err));

app.get("/", (req: Request, res: Response) => {
  return res
    .status(200)
    .json({ status: "success", message: "Welcome to Doxa", data: null });
});
app.use("/v1", routes);
app.use(errorHandler);
app.use("*", (req: Request, res: Response) => {
  return res.status(404).json({
    status: "success",
    message: "Requested route not found",
    data: null,
  });
});

app.listen(PORT, () => console.log(`Server running at port ${PORT}`));
