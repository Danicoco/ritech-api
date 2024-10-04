import { body } from "express-validator";

export const createSchema = [
    body('email').isEmail().withMessage('Enter a valid email').notEmpty().withMessage('Enter email'),
    body('phoneNumber').isString().withMessage('Enter a valid phoneNumber').notEmpty().withMessage('Enter phoneNumber'),
    body('password').isStrongPassword({ minLength: 8, minSymbols: 1 }).withMessage('Enter a strong password').notEmpty().withMessage('Enter password'),
    body('firstName').isString().withMessage('Enter your firstName').notEmpty().withMessage('Enter first name'),
    body('lastName').isString().withMessage('Enter your lastName').notEmpty().withMessage('Enter last name'),
    body('isAdmin').isBoolean().optional().default(false),
]

export const loginSchema = [
    body('email').isEmail().withMessage('Enter your email').notEmpty().withMessage('Enter email'),
    body('isAdmin').isBoolean().optional().default(false),
    body('password').isString().withMessage('Enter your password').notEmpty().withMessage('Enter password'),
]

export const forgetPasswordSchema = [
    body('email').isEmail().withMessage('Enter your email').notEmpty().withMessage('Enter email'),
    body('type').isIn(['forget-password', 'verify-account']).default('forget-password').optional(),
]

export const validateOtpSchema = [
    body('email').isEmail().withMessage('Enter your email').notEmpty().withMessage('Enter email'),
    body('otp').isString().withMessage('Enter otp').notEmpty().withMessage('Enter otp'),
]

export const updateProfileSchema = [
    body('firstName').isString().withMessage('Enter your First Name').optional(),
    body('lastName').isString().withMessage('Enter your last name').optional(),
    body('hasMFA').isBoolean().withMessage('Select a valid hasMFA').optional(),
]

export const createCopierSchema = [
    body("demo").isBoolean().withMessage("Is this for demo account?").notEmpty().withMessage("Is this for demo account?"),
    body("name").isString().withMessage("Enter name").notEmpty().withMessage("Enter name"),
    body("stopLoss").isBoolean().withMessage("Enter StopLoss").notEmpty().withMessage("Enter StopLoss"),
    body("takeProfit").isString().withMessage("Enter takeProfit").notEmpty().withMessage("Enter takeProfit"),
    body("comment").isString().withMessage("Enter comment").notEmpty().withMessage("Enter comment"),
    body("emailAlert").isString().withMessage("Enter emailAlert").notEmpty().withMessage("Enter emailAlert"),
    body("smsAlert").isString().withMessage("Enter smsAlert").notEmpty().withMessage("Enter smsAlert"),
    body("login").isString().withMessage("Enter login").notEmpty().withMessage("Enter login"),
    body("password").isString().withMessage("Enter password").notEmpty().withMessage("Enter password"),
    body("broker").isString().withMessage("Enter broker").notEmpty().withMessage("Enter broker"),
    body("server").isString().withMessage("Enter server").notEmpty().withMessage("Enter server"),
    body("type").isIn(['slave', 'master']).withMessage("Is this a slave or master account?").notEmpty().withMessage("Is this a slave or master account?"),
]
