/** @format */

import { IUser } from "../../../types"
import db from "../../../database/postgres/models"
import BaseRepository from "../../common/repositories/BaseRepository"

class UserService extends BaseRepository<IUser>{
    constructor(params: Partial<IUser>) {
        super(db.user, params)
    }
}

export default UserService
