/** @format */

import { Request, Response, NextFunction } from "express"

import CardService from "./service"
import { success } from "../../common/utils"

export const fetch = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const {
        user: { id },
        query: { limit = 10 },
    } = req
    try {
        const cards = await new CardService({}).findAll(
            { userId: id },
            Number(limit)
        )
        return res.status(200).json(success("Cards retrieved", cards))
    } catch (error) {
        next(error)
    }
}
