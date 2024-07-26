import { Router } from "express";

import authRouter from "./features/auth/route";
import userRouter from "./features/user/route";
import databaseRouter from "./features/database/route";
import collectionRouter from "./features/collection/route";
import documentRouter from "./features/document/route";
import adminRouter from "./features/admin/route";

const router = Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/database", databaseRouter);
router.use("/collection", collectionRouter);
router.use("/document", documentRouter);
router.use("/admin", adminRouter);

export default router;
