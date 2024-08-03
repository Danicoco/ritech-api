/** @format */

import { ICard } from "../../../types"
import db from "../../../database/postgres/models"
import BaseRepository from "../../common/repositories/BaseRepository"

class CardService extends BaseRepository<ICard>{
    constructor(params: Partial<ICard>) {
        super(db.card, params)
    }
}

export default CardService
