/** @format */

import axios from "axios"

import { catchError } from "../common/utils"
import { configs } from "../common/utils/config"
import { PaystackResponse } from "../../types"

const { PAYSTACK_SECRET, PAYSTACK_URL } = configs

export default class Paystack {
    private fee = 0.015

    private feeCap = 2000

    private flatRate = 100

    private reference: string

    private conn = axios.create({
        baseURL: PAYSTACK_URL,
        timeout: 300000,
    })

    constructor(reference = "") {
        this.conn.defaults.headers = {
            common: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${PAYSTACK_SECRET}`,
            },
        }
        this.reference = reference
    }

    public calculateFees(amount: number) {
        const fees = this.fee * amount

        if (amount < 2500) {
            return fees > this.feeCap
                ? amount + this.feeCap
                : amount / (1 - this.fee) + 0.01
        }

        return fees + this.flatRate > this.feeCap
            ? amount + this.feeCap
            : (amount + this.flatRate) / (1 - this.fee) + 0.01
    }

    // eslint-disable-next-line class-methods-use-this
    public calculateTransferFees(amount: number) {
        if (amount < 5000) return amount + 10
        // eslint-disable-next-line no-else-return
        else if (amount < 50000) return amount + 25
        return amount + 50
    }

    public async chargeCard(
        email: string,
        amount: number,
        authorization_code: string,
        reference?: string
    ) {
        const charge = await this.conn
            .post("/transaction/charge_authorization", {
                email,
                authorization_code,
                amount: Math.ceil(this.calculateFees(amount) * 100),
                ...(reference && { reference }),
            })
            .then(({ data }) => data)
            .catch(() => {
                throw catchError("Failed to charge card", 400)
            })

        if (charge.status) {
            return charge.data
        }

        throw catchError("Failed to charge card", 400)
    }

    public async bulkCharge(auths: []) {
        const charge = await this.conn
            .post("/bulkcharge", auths)
            .then(({ data }) => data)
            .catch(_e => {
                throw catchError("Failed to charge card", 400)
            })

        if (charge.status) {
            return charge.data
        }

        throw catchError("Failed to charge card", 400)
    }

    public async getBalance() {
        const trf = await this.conn
            .get("/balance")
            .then(({ data }) => data)
            .catch(() => {
                throw catchError("Failed to get balance info", 400)
            })

        if (trf.status) {
            return trf.data
        }

        throw catchError("Failed to get balance info", 400)
    }

    public async verifyAccountDetails(accNumber: string, code: string) {
        const trf = await this.conn
            .get(`/bank/resolve?account_number=${accNumber}&bank_code=${code}`)
            .then(({ data }) => data)
            .catch(e => {
                throw catchError(e, 400)
            })

        if (trf.status) {
            return trf.data
        }

        throw catchError("Failed to verify account", 400)
    }

    public async verifyTransaction() {
        const verify = await this.conn
            .get<PaystackResponse>(`/transaction/verify/${this.reference}`)
            .then(({ data }) => data)
            .catch(() => {
                throw catchError("Failed to verify transaction", 400)
            })

        if (verify.status) {
            return verify.data
        }

        throw catchError("Failed to verify transaction", 400)
    }

    public async refundTransaction(transaction: string, amount?: number) {
        const refund = await this.conn
            .post("/refund", {
                transaction,
                ...(amount && { amount: amount * 100 }),
            })
            .then(({ data }) => data)
            .catch(() => {
                throw catchError("Failed to refund transaction", 400)
            })

        if (refund.status) {
            return refund
        }

        throw catchError("Failed to refund transaction", 400)
    }

    public async getBankList(): Promise<
        {
            id: number
            name: string
            slug: string
            code: string
            longcode: string
            gateway: string
            pay_with_bank: boolean
            supports_transfer: boolean
            active: boolean
            country: string
            currency: string
            type: string
            is_deleted: boolean
            createdAt: string
            updatedAt: string
        }[]
    > {
        const refund = await this.conn
            .get("/bank")
            .then(({ data }) => data)
            .catch(() => {
                throw catchError("Failed to get bank list", 400)
            })

        if (refund.status) {
            return refund.data
        }

        throw catchError("Failed to get bank list", 400)
    }
}