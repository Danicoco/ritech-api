/** @format */

import { Router } from "express"
import { addFilters, addTemplate, fetchPosition, getFees, getMasterOrder, getReports, getSettings, getSlaveOrder, getTemplate, getWalletDeposits, updateTemplate, updateTradierAccount } from "./controller"
import { addFiltersSchema, createTemplateSchema, feesSchema, filterSchema, getTemplateSchema, positionSchema, updateTemplateSchema } from "./validation";
import { validate } from "../../common/utils";
import { createCopierSchema } from "../users/validation";

const copierRouter = Router({ caseSensitive: true, strict: true })

copierRouter.get("/get-settings", getSettings);
copierRouter.get("/positions", positionSchema, validate, fetchPosition);
copierRouter.post("/template", createTemplateSchema, validate, addTemplate);
copierRouter.patch("/template", updateTemplateSchema, validate, updateTemplate);
copierRouter.get("/template", getTemplateSchema, validate, getTemplate);
copierRouter.post("/filters", addFiltersSchema, validate, addFilters);
copierRouter.get("/reports", filterSchema, validate, getReports);
copierRouter.get("/wallet-deposits", getWalletDeposits);
copierRouter.get("/fees", feesSchema, validate, getFees);
copierRouter.get("/master-orders", filterSchema, validate, getMasterOrder);
copierRouter.get("/slave-orders", filterSchema, validate, getSlaveOrder);
copierRouter.patch("/account",  createCopierSchema, validate, updateTradierAccount);


export default copierRouter
