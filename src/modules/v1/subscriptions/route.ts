import { Router } from "express";
import { createSchema } from "./validation";
import { Authenticate, validate } from "../../common/utils";
import { create, fetch, subscribe } from "./controller";

const subscriptionRouter = Router();

subscriptionRouter.post('/', Authenticate, createSchema, validate, create);
subscriptionRouter.get('/pay', subscribe);
subscriptionRouter.get('/history', Authenticate, fetch);

export default subscriptionRouter;