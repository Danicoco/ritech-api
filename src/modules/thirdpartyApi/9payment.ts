/** @format */

import axios from "axios"
import { ConfirmPSB9Payment, StaticVirtualAccount } from "../../types"
import { configs } from "../common/utils/config"

class PSB9 {
    private async token() {
        const body = {
            publickey: configs.PSB_PUBLIC_KEY,
            privatekey: configs.PSB_PRIVATE_KEY,
        }
        const { data } = await axios.post(
            `${configs.PSB_BASE_URL}/v1/merchant/virtualaccount/authenticate`,
            body
        )

        return data?.access_token;
    }

    public async createStaticVirtualAccount(payload: StaticVirtualAccount) {
        const token = await this.token()
        const data = await axios.post(
            `${configs.PSB_BASE_URL}/v1/merchant/virtualaccount/create`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        console.log(data, "Create Account")
        return data.data;
    }

    public async confirmPayment(payload: ConfirmPSB9Payment) {
        const token = await this.token()
        const { data } = await axios.post(`${configs.PSB_BASE_URL}/v1/merchant/virtualaccount/confirmpayment`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        return data
    }
}

export default PSB9
