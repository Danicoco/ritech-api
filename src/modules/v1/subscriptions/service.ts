/** @format */

import { ISubscription } from "../../../types"
import db from "../../../database/postgres/models"
import BaseRepository from "../../common/repositories/BaseRepository"
import { Op } from "sequelize"

class SubscriptionService extends BaseRepository<ISubscription> {
    constructor(params: Partial<ISubscription>) {
        super(db.subscription, params)
    }

    public async getSubscriptions(active: boolean, fromDate: string, toDate: string) {
        return db.subscription.findAll({
            where: {
                isActive: active,
                createdAt: {
                    [Op.gte]: new Date(fromDate),
                    [Op.lte]: new Date(toDate)
                }
            },
            raw: true,
        })
    }
}

export default SubscriptionService
