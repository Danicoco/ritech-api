import { Router } from "express";
import { convertSchema, currencySchema, subscribeSchema } from "./validation";
import { validate } from "../../common/utils";
import { convert, get, subscribe } from "./controller";

const walletRouter = Router();

walletRouter.post('/convert', convertSchema, validate, convert);
walletRouter.post('/subscribe', subscribeSchema, validate, subscribe);
walletRouter.get('/', currencySchema, validate, get);

export default walletRouter;