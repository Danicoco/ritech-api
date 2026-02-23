/** @format */

import { body, query } from "express-validator"

export const convertSchema = [
    body("baseCurrency").isIn(['NGN', 'USD']).withMessage("Base Currency must be in NGN or USD").notEmpty({ ignore_whitespace: true }),        
    body("targetCurrency").isIn(['NGN', 'USD']).withMessage("Base Currency must be in NGN or USD").notEmpty({ ignore_whitespace: true }),        
    body("amount").isNumeric().withMessage("Enter amount").notEmpty().withMessage("Enter amount"),
]

export const subscribeSchema = [
    body("planId").isUUID().withMessage("Select plan").notEmpty().withMessage("Select plan"),
]

export const currencySchema = [
    query("currency").isIn(['NGN', 'USD']).withMessage("Currency missing").notEmpty().withMessage("Currency missing"),
]
