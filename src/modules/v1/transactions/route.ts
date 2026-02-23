import { Router } from "express";
import { Authenticate  } from "../../common/utils";
import { fetch } from "./controller";

const transactionRouter = Router();

transactionRouter.get('/', Authenticate, fetch);

export default transactionRouter;