import { Router } from "express";

import userRouter from "./users/route";
import copierRouter from "./trade-copier/route";
import { Authenticate } from "../common/utils";
import cardRouter from "./cards/route";
import subscriptionRouter from "./subscriptions/route";
import planRouter from "./plans/route";

const router = Router();


router.use("/users", userRouter);
router.use("/copier", Authenticate, copierRouter)
router.use("/cards", Authenticate, cardRouter);
router.use("/plans", Authenticate, planRouter);
router.use("/subscriptions", subscriptionRouter);

export default router;
