/** @format */

import { NextFunction, Request, Response } from "express"
import { success } from "../../common/utils"
import TransactionService from "./service"

export const fetch = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { limit = 10, next: nextPage, prev } = req.query
    try {
        let transactions = await new TransactionService({}).findAll(
            {
                user: String(req.user.id),
            },
            Number(limit),
            nextPage as string,
            prev as string
        )

        return res
            .status(200)
            .json(success("Transactions retrieved successfully", transactions))
    } catch (error) {
        next(error)
    }
}
