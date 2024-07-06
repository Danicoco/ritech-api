/** @format */

import { Router } from "express"
import { addFilters, addTemplate, fetchPosition, getSettings, getTemplate, updateTemplate } from "./controller"
import { addFiltersSchema, createTemplateSchema, getTemplateSchema, positionSchema, updateTemplateSchema } from "./validation";
import { validate } from "../../common/utils";

const copierRouter = Router({ caseSensitive: true, strict: true })

copierRouter.get("/get-settings", getSettings);
copierRouter.get("/positions", positionSchema, validate, fetchPosition);
copierRouter.post("/template", createTemplateSchema, validate, addTemplate);
copierRouter.patch("/template", updateTemplateSchema, validate, updateTemplate);
copierRouter.get("/template", getTemplateSchema, validate, getTemplate);
copierRouter.post("/filters", addFiltersSchema, validate, addFilters);


export default copierRouter
