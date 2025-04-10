import { Router } from "express";
import { createSchema } from "./validation";
import { Authenticate, validate } from "../../common/utils";
import { create, fetch, get, subscribe } from "./controller";

const subscriptionRouter = Router();

subscriptionRouter.post('/', Authenticate, createSchema, validate, create);
subscriptionRouter.post('/pay', Authenticate, subscribe);
subscriptionRouter.get('/history', Authenticate, fetch);
subscriptionRouter.get('/current', Authenticate, get);

export default subscriptionRouter;