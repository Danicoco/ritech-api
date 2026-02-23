/** @format */

import { body } from "express-validator"

export const createSchema = [
    body("planId")
        .isString()
        .withMessage("Enter plan id")
        .notEmpty()
        .withMessage("Enter plan id"),
    body("reference")
        .isString()
        .withMessage("Enter reference")
        .notEmpty()
        .withMessage("Enter reference"),
    body("accountNumber")
        .isString()
        .withMessage("Enter accountNumber")
        .notEmpty()
        .withMessage("Enter accountNumber"),
    body("amount")
        .isInt()
        .withMessage("Enter amount")
        .notEmpty()
        .withMessage("Enter amount"),
]
