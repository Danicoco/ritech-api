/** @format */

import { ITransaction } from "../../../types"
import db from "../../../database/postgres/models"
import BaseRepository from "../../common/repositories/BaseRepository"


class TransactionService extends BaseRepository<ITransaction> {
    constructor(params: Partial<ITransaction>) {
        super(db.transaction, params)
    }
}

export default TransactionService
