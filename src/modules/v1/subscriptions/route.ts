import { Router } from "express";
import { createSchema } from "./validation";
import { validate } from "../../common/utils";
import { create, fetch, subscribe } from "./controller";

const subscriptionRouter = Router();

subscriptionRouter.post('/', createSchema, validate, create);
subscriptionRouter.get('/pay', createSchema, validate, subscribe);
subscriptionRouter.get('/history', fetch);

export default subscriptionRouter;