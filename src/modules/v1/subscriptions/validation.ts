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
]
