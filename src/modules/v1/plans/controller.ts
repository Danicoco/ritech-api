/** @format */

import { NextFunction, Request, Response } from "express"
import { catchError, success, tryPromise } from "../../common/utils"
import PlanService from "./service"
import SubscriptionService from "../subscriptions/service"
import { Op } from "sequelize"

export const create = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user.isAdmin)
            throw catchError("You're not authorized to use this endpoint", 400)

        let [plan, error] = await tryPromise(
            new PlanService({}).create(req.body)
        )
        if (error) throw catchError("Error processing your request", 400)

        return res.status(200).json(success("Plan created successfully", plan))
    } catch (error) {
        next(error)
    }
}

export const fetch = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { limit = 10, next: nextPage, prev, search } = req.query
    try {
        let [plan, error] = (await tryPromise(
            new PlanService({}).findAll(
                {
                    ...((search && {
                        name: {
                            [Op.iLike]: `%${search}%`,
                        },
                    })),
                },
                Number(limit),
                String(nextPage),
                String(prev)
            )
        )) as any
        if (error) throw catchError("Error processing your request", 400)

        return res
            .status(200)
            .json(success("Record fetched successfully", plan))
    } catch (error) {
        next(error)
    }
}

export const update = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user.isAdmin)
            throw catchError("You're not authorized to use this endpoint", 400)

        let [plan, error] = await tryPromise(
            new PlanService({ id: req.params.id }).update(req.body)
        )
        if (error) throw catchError("Error processing your request", 400)

        return res
            .status(200)
            .json(success("Record updated successfully", plan))
    } catch (error) {
        next(error)
    }
}

export const remove = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user.isAdmin)
            throw catchError("You're not authorized to use this endpoint", 400)

        const [subscription, subError] = await tryPromise(
            new SubscriptionService({
                plan: req.params.id,
                isActive: true,
            }).findOne()
        )

        if (subError) throw catchError("Error processing your request", 400)

        if (subscription)
            throw catchError("Cannot delete plan currently in use")

        const [plan, error] = await tryPromise(
            new PlanService({ id: req.params.id }).delete()
        )
        if (error) throw catchError("Error processing your request", 400)

        return res.status(200).json(success("Plan deleted successfully", plan))
    } catch (error) {
        next(error)
    }
}
