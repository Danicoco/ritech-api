/** @format */

import { body } from "express-validator"

export const createSchema = [
    body("name")
        .isString()
        .withMessage("Enter plan name")
        .notEmpty()
        .withMessage("Enter plan name"),
    body("description")
        .isString()
        .withMessage("Enter description")
        .notEmpty()
        .withMessage("Enter descripton"),
    body("interval")
        .isIn(["yearly", "monthly"])
        .withMessage("Interval must be either yearly or monthly")
        .notEmpty()
        .withMessage("Interval must be either yearly or monthly"),
    body("amount")
        .isNumeric()
        .withMessage("Enter valid amount")
        .notEmpty()
        .withMessage("Enter amount"),
]

export const fetchSchema = [
    body("next")
        .isString()
        .withMessage("Enter plan name")
        .optional(),
    body("prev")
        .isString()
        .withMessage("Enter description")
        .optional(),
    body("limit")
        .isNumeric()
        .optional(),
]