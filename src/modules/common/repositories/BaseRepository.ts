/** @format */

import { Op, Transaction } from "sequelize"
import { IPaginator, PaginateResponse } from "../../../types"
import { addDays } from "date-fns"

class BaseRepository<T> {
    protected model: any

    private finderOptions: Partial<T>

    private composeFinder(params: Partial<T>) {
        const isValidValue = (value: string) =>
            value !== "" && value !== undefined

        Object.entries(params).forEach(([key, value]) => {
            if (!isValidValue(value as string)) {
                delete (params as any)[key]
            }
        })

        return params
    }

    constructor(model: any, finderOptions: Partial<T>) {
        this.model = model
        this.finderOptions = this.composeFinder(finderOptions)
    }

    public async create(params: T, transaction?: Transaction): Promise<T> {
        return this.model.create(params, {
            ...(transaction && { transaction }),
            raw: true
        })
    }

    public async bulkCreate(params: T[], transaction?: Transaction): Promise<T[]> {
        return this.model.bulkCreate(params, { transaction })
    }

    public async update(
        param: Partial<T>,
        transaction?: Transaction
    ): Promise<T> {
        const result = await this.model.update(param, {
            where: this.finderOptions,
            ...(transaction && { transaction }),
        })

        return result;
    }

    public async findOne(transaction?: Transaction): Promise<T | null> {
        return this.model.findOne({
            where: this.finderOptions,
            transaction,
            raw: true
        }, )
    }

    public async countDocuments(
        fromDate?: string,
        toDate?: string
    ): Promise<number | null> {
        return this.model.count({
            where: {
                ...this.finderOptions,
                ...(fromDate &&
                    toDate && {
                        createdAt: {
                            [Op.gte]: new Date(fromDate),
                            [Op.lt]: addDays(new Date(toDate), 1),
                        },
                    }),
            },
        })
    }

    public async delete(transaction?: Transaction): Promise<T | null> {
        return this.model.destroy({
            where: this.finderOptions,
            ...(transaction && { transaction }),
        })
    }

    public async findAll(
        params: Partial<T> | any,
        limit?: number,
        next = "",
        prev = "",
        order?: string[][]
    ) {
        const datas = await this.paginate({
            query: { ...params },
            limit,
            prev,
            next,
            order,
        })
        const result = datas.edges.map((data: any) => {
            const obj = {
                ...data.node.toJSON(),
            }

            return obj as T
        })

        return {
            edges: [...result],
            pageInfo: datas.pageInfo,
            totalCount: datas.totalCount,
        }
    }

    private async paginate(
        params: IPaginator<Partial<T>> | any
    ): Promise<PaginateResponse<T>> {
        const { query, next, prev, limit, attributes, order } = params

        return this.model.paginate({
            where: query,
            ...(next && { after: next }),
            ...(prev && { before: prev }),
            ...(limit && { limit }),
            ...(attributes && { attributes }),
            order: order || [["createdAt", "DESC"]],
        })
    }
}

export default BaseRepository
