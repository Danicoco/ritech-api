import { body, query } from "express-validator";

export const positionSchema = [
    query('type').isIn(['close', 'open']).withMessage('Type must be either close or open').notEmpty().withMessage('Type must be either close or open'),
    query('start').isNumeric().withMessage('Enter a valid start').notEmpty().withMessage('Enter a valid start'),
    query('length').isNumeric().withMessage('Enter a valid length').notEmpty().withMessage('Enter a valid length'),
]

export const createTemplateSchema = [
    body('name').isString().withMessage('Enter template name').notEmpty().withMessage('Enter template name')
]

export const updateTemplateSchema = [
    body('name').isString().withMessage('Enter template name').notEmpty().withMessage('Enter template name'),
    body('groupId').isString().withMessage('Enter template group Id').notEmpty().withMessage('Enter template goupd Id')
]

export const getTemplateSchema = [
    query('name').isString().withMessage('Enter template name').notEmpty().withMessage('Enter template name'),
    query('groupId').isString().withMessage('Enter template group Id').notEmpty().withMessage('Enter template goupd Id')
]

export const addFiltersSchema = [
    query('symbol').isString().withMessage('Enter filter symbol').notEmpty().withMessage('Enter filter symbol'),
    query('status').isIn(['on', 'off']).withMessage('You can either turn on or off').notEmpty().withMessage('You can either turn on or off'),
    query('type').isIn(['whitelist', 'blacklist']).withMessage('Type is either whitelist or blacklist').notEmpty().withMessage('Type is either whitelist or blacklist')
]

export const filterSchema = [
    query('start').isNumeric().withMessage('Enter a valid start').notEmpty().withMessage('Enter start'),
    query('length').isNumeric().withMessage('Enter a valid length').notEmpty().withMessage('Enter length'),
]

export const feesSchema = [
    query('message').isIn(["DAILY_FEES", "DAILY_ORDER", "DAILY_UPDATE"]).withMessage('Message must in DAILY_FEES, DAILY_ORDER, DAILY_UPDATE').notEmpty().withMessage('message must be in DAILY_FEES, DAILY_ORDER, DAILY_UPDATE'),
    query('date_fees').isString().withMessage('Enter a date_fees').notEmpty().withMessage('Enter date_fees'),
    query('amount').isString().withMessage('Enter an amount').notEmpty().withMessage('Enter amount'),
]