/** @format */

import { NextFunction, Request, Response } from "express"
import { catchError, success, tryPromise } from "../../common/utils"
import TradeCopier from "../../thirdpartyApi/trade-copier"

export const getSettings = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { meta } = req.user
    try {
        const [settings, error] = await tryPromise(
            new TradeCopier().getSettings("", meta?.id)
        )

        if (error) throw catchError("Error retrieving settings")

        return res
            .status(200)
            .json(success("Settings successfully retrieved", settings))
    } catch (error) {
        next(error)
    }
}

export const fetchPosition = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { page = 1, limit = 10, type } = req.query
    try {
        const [positions, error] = await tryPromise(
            type === "close"
                ? new TradeCopier().getClosedPositions({
                      start: Number(page),
                      length: Number(limit),
                  })
                : new TradeCopier().getOpenPositions({
                      start: Number(page),
                      length: Number(limit),
                  })
        )

        if (error) throw catchError("Error getting positions")

        return res
            .status(200)
            .json(success("Positions fetched successfully", positions))
    } catch (error) {
        next(error)
    }
}

export const addTemplate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const [template, error] = await tryPromise(new TradeCopier().addTemplate({ name: req.body.name }));

        if (error) throw catchError('Error adding template');

        return res.status(201).json(
            success("Template successfully added", template)
        )
    } catch (error) {
        next(error)       
    }
}

export const updateTemplate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { name, groupId } = req.body;
    try {
        const [template, error] = await tryPromise(
            new TradeCopier().editTemplate({ name, group_id: groupId }),
        )

        if (error) throw catchError('Error while attempting to update your template');

        return res.status(200).json(
            success('Template updated successfully', template)
        )
    } catch (error) {
        next(error)       
    }
}

export const getTemplate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { name, groupId } = req.query
    try {
        const [template, error] = await tryPromise(
            new TradeCopier().getTemplate({ name: String(name), group_id: String(groupId) }),
        )

        if (error) throw catchError('Error while attempting to update your template');

        return res.status(200).json(
            success('Template retrieved successfully', template)
        )
    } catch (error) {
        next(error)       
    }
}

export const addFilters = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { symbol, status, type } = req.body;
    const { meta } = req.user;
    try {
        const [filters, error] = await tryPromise(
            new TradeCopier().addFilters({ user_id: String(meta?.id), symbol: String(symbol), status: status === 'on' ? 0 : 1, type: type.toLowerCase() === 'whitelist' ? 0 : 1 }),
        )

        if (error) throw catchError('Error while processing your request');

        return res.status(200).json(
            success('Filter added successfully', filters)
        )
    } catch (error) {
        next(error)       
    }
}
