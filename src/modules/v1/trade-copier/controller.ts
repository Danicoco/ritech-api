/** @format */

import { NextFunction, Request, Response } from "express"
import { catchError, success, tryPromise } from "../../common/utils"
import TradeCopier from "../../thirdpartyApi/trade-copier"
import UserService from "../users/service"

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

export const setSettings = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const [settings, error] = await tryPromise(
            new TradeCopier().setSettings(req.body)
        )

        if (error) throw catchError("Error updating settings")

        return res
            .status(200)
            .json(success("Settings successfully updated", settings))
    } catch (error) {
        next(error)
    }
}

export const fetchPosition = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { start = 1, length = 10 } = req.query
   const type = req.query.type;
    try {
        delete req.query.type;
        const [positions, error] = await tryPromise(
            type === "close"
                ? new TradeCopier().getClosedPositions({
                      start: Number(start),
                      length: Number(length),
                      ...req.query
                  })
                : new TradeCopier().getOpenPositions({
                      start: Number(start),
                      length: Number(length),
                      ...req.query
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

export const getReports = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { start, length } = req.query;
    try {
        const [reports, error] = await tryPromise(
            new TradeCopier().getReporting({ start: Number(start), length: Number(length) })
        );

        if (error) {
            throw catchError('Error getting report', 500)
        }

        return res.status(200).json(
            success('Reports retrieved successfuly', reports)
        )
    } catch (error) {
        next(error);
    }
}

export const getMasterOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { start, length } = req.query;
    try {
        const [orders, error] = await tryPromise(
            new TradeCopier().getMasterOrders({ start: Number(start), length: Number(length) })
        );

        if (error) {
            throw catchError('Error getting master order', 500)
        }

        return res.status(200).json(
            success('Master orders retrieved successfuly', orders)
        )
    } catch (error) {
        next(error);
    }
}

export const getSlaveOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { start, length, master_order_id } = req.query;
    try {
        const [orders, error] = await tryPromise(
            new TradeCopier().getSlaveOrders({ start: Number(start), length: Number(length), master_order_id: String(master_order_id) })
        );

        if (error) {
            throw catchError('Error getting master order', 500)
        }

        return res.status(200).json(
            success('Master orders retrieved successfuly', orders)
        )
    } catch (error) {
        next(error);
    }
}

export const getWalletDeposits = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const [deposits, error] = await tryPromise(
            new TradeCopier().getEwalletDeposits({})
        );

        if (error) {
            throw catchError('Error getting wallet deposits', 500)
        }

        return res.status(200).json(
            success('Wallet retrieved successfuly', deposits)
        )
    } catch (error) {
        next(error);
    }
}

export const getFees = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const {
        amount,
        date_fees,
        message
    } = req.body
    try {
        const [deposits, error] = await tryPromise(
            new TradeCopier().getFees({
                amount,
                date_fees,
                message
            })
        );

        if (error) {
            throw catchError('Error getting wallet deposits', 500)
        }

        return res.status(200).json(
            success('Wallet retrieved successfuly', deposits)
        )
    } catch (error) {
        next(error);
    }
}

export const updateTradierAccount = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { type } = req.body;
    try {
        if (type === "master" && !req.user.isAdmin) {
            throw catchError('Invalid Operation')
        }

        const [account, accountError] = await tryPromise(
            new TradeCopier().updateAccount({ ...req.body }),
        )

        if (accountError) {
            throw catchError("Error creating your slave account")
        }

        if (account.error) {
            throw catchError(account.error)
        }

        let [user, error] = await tryPromise(
            new UserService({ id: req.user.id }).update({ meta: account })
        )
        if (error) throw catchError("Error processing your request", 400)

        delete user?.password

        return res
            .status(200)
            .json(success("Copier account created successfully", user))
    } catch (error) {
        next(error);
    }
}

export const deleteCopier = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { accountId, } = req.query;
    try {
        console.log({accountId});
        await new TradeCopier().deleteAccount(accountId as string);

        return res.status(200).json(
            success(`Copier account delete successfully`, {})
        )
    } catch (error) {
        next(error);
    }
}