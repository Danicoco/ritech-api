/* eslint max-len: ["error", { "code": 200 }] */

const OtpMails = (name: string, otp: string, type: string) => {
    return `<body style="margin: 0; padding: 0;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td style="padding: 10px 0 30px 0;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="80%" style="border-bottom: 1px solid #cccccc; border-collapse: collapse;" >
                    <tr>
                        <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; text-align: center;">
                            Dear ${name}
                        </td>
                    </tr>
                    <tr>
                        <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; text-align: center;">
                            Use code below to ${type}
                        </td>
                    </tr>
                    <tr>
                        <td style="color: #153643; font-family: Arial, sans-serif; font-size: 14px; text-align: center;color: #919eaa;">
                            <div style="margin: 30px auto 30px auto;">
                                ${otp}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; text-align: center;">
                            Regards
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>`;
};

export default OtpMails;
