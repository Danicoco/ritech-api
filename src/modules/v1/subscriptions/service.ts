/** @format */

import { ISubscription } from "../../../types"
import db from "../../../database/postgres/models"
import BaseRepository from "../../common/repositories/BaseRepository"

class SubscriptionService extends BaseRepository<ISubscription>{
    constructor(params: Partial<ISubscription>) {
        super(db.subscription, params)
    }
}

export default SubscriptionService
