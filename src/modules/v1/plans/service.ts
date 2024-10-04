/** @format */

import { IPlan } from "../../../types"
import db from "../../../database/postgres/models"
import BaseRepository from "../../common/repositories/BaseRepository"
import { Op } from "sequelize"

class PlanService extends BaseRepository<IPlan>{
    constructor(params: Partial<IPlan>) {
        super(db.plan, params)
    }

    public async findByIds (ids: string[]): Promise<IPlan[]> {
        const sub = await db.plan.findAll({
            where: {
                id: {
                    [Op.in]: ids
                }
            }
        })

        return sub;
    }
}

export default PlanService
