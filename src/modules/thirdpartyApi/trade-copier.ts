/** @format */

import axios, { AxiosError } from "axios"
import { catchError } from "../common/utils"
import {
    ITradeCopierFilters,
    ITradeCopierAccount,
    ITradeCopierMapping,
    ITradeCopierSettings,
    ITradeCopierEditMapping,
    ITradeCopierGlobalProtection,
} from "../../types"
import { configs } from "../common/utils/config"

class TradeCopier {
    private http = () =>
        axios.create({
            baseURL: configs.TRADE_COPIER_BASE_URL,
            timeout: 30000,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Auth-Username": configs.TRADE_COPIER_USERNAME,
                "Auth-Token": configs.TRADE_COPIER_AUTH,
            },
        })
    constructor() {}

    public async createAccount(
        payload: ITradeCopierAccount,
        type: "master" | "slave"
    ) {
        const body = {
            type: type === "master" ? 0 : 1,
            ...payload,
        }

        const { data } = await this.http()
            .post("/account/addAccount.php", body)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }

    public async deleteAccount(account_id: string) {
        const body = {
            account_id,
        }

        const { data } = await this.http()
            .post("/account/deleteAccount.php", body)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }

    public async getAccounts(account_id?: string) {
        const body = {
            account_id,
        }

        const { data } = await this.http()
            .post("/account/getAccounts.php", body)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }

    public async updateAccount(payload: ITradeCopierAccount) {
        const body = payload

        const { data } = await this.http()
            .post("/account/updateAccount.php", body)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }

    public async getActiveSubscriptions(type?: "master" | "slave") {
        const body = {
            type: type === "master" ? 0 : type === "slave" ? 1 : "",
        }

        const { data } = await this.http()
            .post("/subscription/getSubscriptions.php", body)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }

    public async getSettings(
        masterId?: string,
        slaveId?: string,
        groupId?: string
    ) {
        const body = {
            id_master: masterId,
            id_slave: slaveId,
            id_group: groupId,
        }

        const { data } = await this.http()
            .post("/settings/getSettings.php", body)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }

    public async setSettings(payload: ITradeCopierSettings) {
        const body = {
            ...payload,
        }

        const { data } = await this.http()
            .post("/settings/setSettings.php", body)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }

    public async addMapping(payload: Array<ITradeCopierMapping>) {
        const body = {
            ...payload,
        }

        const { data } = await this.http()
            .post("/mapping/addMappings.php", body)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }

    public async deleteAllMapping(
        payload: Omit<ITradeCopierMapping, "symbol" | "symbol_master">
    ) {
        const body = {
            ...payload,
        }

        const { data } = await this.http()
            .post("/mapping/deleteAllMappings.php", body)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }

    public async deleteMapping(payload: ITradeCopierMapping) {
        const body = {
            ...payload,
        }

        const { data } = await this.http()
            .post("/mapping/deleteMapping.php", body)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }

    public async editMapping(payload: ITradeCopierEditMapping) {
        const body = {
            ...payload,
        }

        const { data } = await this.http()
            .post("/mapping/editMapping.php", body)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }

    public async setGlobalProtection(payload: ITradeCopierGlobalProtection) {
        const body = {
            ...payload,
        }

        const { data } = await this.http()
            .post("/protection/setGlobalProtection.php", body)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }

    public async getGlobalProtection(slave_id: string) {
        const body = {
            slave_id,
        }

        const { data } = await this.http()
            .post("/protection/getGlobalProtection.php", body)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }

    public async addFilters(payload: ITradeCopierFilters) {
        const { data } = await this.http()
            .post("/filter/addFiltersSymbol.php", payload)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }

    public async editFilters(payload: ITradeCopierFilters) {
        const { data } = await this.http()
            .post("/filter/editFiltersSymbol.php", payload)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }

    public async getFilters(payload: ITradeCopierFilters) {
        const { data } = await this.http()
            .post("/filter/getFiltersSymbols.php", payload)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }

    public async deleteFilters(payload: { user_id: string; symbol: string }) {
        const { data } = await this.http()
            .post("/filter/deleteFiltersSymbol.php", payload)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }

    public async addTemplate(payload: { name: string }) {
        const { data } = await this.http()
            .post("/template/addTemplate.php", payload)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }

    public async editTemplate(payload: { name: string; group_id: string }) {
        const { data } = await this.http()
            .post("/template/editTemplate.php", payload)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }

    public async getTemplate(payload: { name: string; group_id: string }) {
        const { data } = await this.http()
            .post("/template/getTemplates.php", payload)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }

    public async deleteTemplates(payload: { group_id: string }) {
        const { data } = await this.http()
            .post("/template/deleteTemplate.php", payload)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }

    public async getOrderStatusComment(payload: { comment: string }) {
        const { data } = await this.http()
            .post("/order/getOrderStatusComment.php", payload)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }

    public async getSlaveOrders(payload: {
        start: number
        length: number
        master_order_id?: string
    }) {
        const { data } = await this.http()
            .post("/order/getSlaveOrders.php", payload)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }

    public async getMasterOrders(payload: { start: number; length: number }) {
        const { data } = await this.http()
            .post("/order/getMasterOrders.php", payload)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }

    public async getClosedPositions(payload: {
        start: number
        length: number
    }) {
        const { data } = await this.http()
            .post("/position/getClosedPositions.php", payload)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }

    public async getOpenPositions(payload: { start: number; length: number }) {
        const { data } = await this.http()
            .post("/position/getOpenPositions.php", payload)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }

    public async getReporting(payload: { start: number; length: number }) {
        const { data } = await this.http()
            .post("/reporting/getReporting.php", payload)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }

    public async getEwalletDeposits(payload: {}) {
        const { data } = await this.http()
            .post("/deposit/getEwalletDeposits.php", payload)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }

    public async getFees(payload: {
        amount: string
        date_fees: string
        message: "DAILY_FEES" | "DAILY_ORDER" | "DAILY_UPDATE"
    }) {
        const { data } = await this.http()
            .post("/fee/getFees.php", payload)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }

    public async getNotifications(payload: {
        timestamp: Date
        type: 0 | 1 | 2 | 3 //0=error, 1=success, 2=warning, 3=info
        name: string
        text: string
    }) {
        const { data } = await this.http()
            .post("/notification/getNotifications.php", payload)
            .catch((e: AxiosError) => {
                throw catchError(e.response?.data.message)
            })

        return data
    }
}

export default TradeCopier