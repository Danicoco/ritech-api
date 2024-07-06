import { Router } from "express";

// import transactionRouter from "./transactions/route";
import userRouter from "./users/route";
import copierRouter from "./trade-copier/route";

const router = Router();


router.use("/users", userRouter);
router.use("/copier", copierRouter)
// router.use("/transactions", Authenticate, transactionRouter);

export default router;
