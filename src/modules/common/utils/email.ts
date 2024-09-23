/** @format */

import { IMail } from "../../../types"
import { configs } from "./config"

const { SendMailClient } = require("zeptomail")

const sendMail = async ({ name, email, subject, message }: IMail) => {
    return new Promise(resolve => {
        let client = new SendMailClient({
            url: configs.ZEPTOMAIL_BASE_URL,
            token: configs.ZEPTOMAIL_TOKEN,
        })

        client
            .sendMail({
                from: {
                    address: "support@ritechtrade.com",
                    name: "Ritech",
                },
                to: [
                    {
                        email_address: {
                            address: email,
                            name: name,
                        },
                    },
                ],
                subject: subject,
                htmlbody: `<div>${message}</div>`,
            })
            .then((resp: unknown) => console.log(resp, "success")).catch((error: Error) => console.log("error", error.message));
    })
}

export default sendMail
