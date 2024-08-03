import { Router } from "express";
import { fetch } from "./controller";

const cardRouter = Router();

cardRouter.get('/fetch', fetch);


export default cardRouter;
