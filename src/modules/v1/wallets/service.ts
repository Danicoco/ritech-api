/** @format */

import { IWallet } from "../../../types"
import db from "../../../database/postgres/models"
import BaseRepository from "../../common/repositories/BaseRepository"

class WalletService extends BaseRepository<IWallet> {
    constructor(params: Partial<IWallet>) {
        super(db.wallet, params)
    }
}

export default WalletService
