import { body, query } from "express-validator";

export const positionSchema = [
    query('type').isIn(['close', 'open']).withMessage('Type must be either close or open').notEmpty().withMessage('Type must be either close or open')
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
