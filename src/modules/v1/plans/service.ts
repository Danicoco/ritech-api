/** @format */

import { IPlan } from "../../../types"
import db from "../../../database/postgres/models"
import BaseRepository from "../../common/repositories/BaseRepository"

class PlanService extends BaseRepository<IPlan>{
    constructor(params: Partial<IPlan>) {
        super(db.plan, params)
    }
}

export default PlanService
