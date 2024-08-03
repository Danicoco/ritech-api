import { Router } from "express";
import { createSchema, fetchSchema } from "./validation";
import { validate } from "../../common/utils";
import { create, fetch, remove, update } from "./controller";

const planRouter = Router();

planRouter.post('/', createSchema, validate, create);
planRouter.get('/', fetchSchema, validate, fetch);
planRouter.patch('/:id', createSchema, validate, update);
planRouter.delete('/:id', remove);

export default planRouter;