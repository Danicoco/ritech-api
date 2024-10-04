/** @format */

import { IUser } from "../../../types"
import db from "../../../database/postgres/models"
import BaseRepository from "../../common/repositories/BaseRepository"
import { Op } from "sequelize"

class UserService extends BaseRepository<IUser>{
    constructor(params: Partial<IUser>) {
        super(db.user, params)
    }

    public async getUnsubscribedUser() {
        return db.user.findAll({
            where: {
                subscriptionId: {
                    [Op.eq]: ""
                },
                isAdmin: false
            }
        })
    }

    public async findByIds (ids: string[]): Promise<IUser[]> {
        const sub = await this.model.findAll({
            where: {
                id: {
                    [Op.in]: ids
                }
            }
        })

        return sub;
    }
}

export default UserService
