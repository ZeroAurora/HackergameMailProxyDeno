// @deno-types="@types/nodemailer"
import { createTransport } from "nodemailer";
import { env } from "./env.ts";
import { IHGMailRequest, SendMailStatus } from "./types.ts";
import { checkTraffic, storeTraffic } from "./redis.ts";

// email client config
const option = {
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  auth: {
    user: env.SMTP_USERNAME,
    pass: env.SMTP_PASSWORD,
  },
  secure: false,
};

const transport = createTransport(option);

globalThis.addEventListener("beforeunload", () => {
  transport.close();
});

// email validation
function validateEmail(email: string) {
  // 11digits@stu.xidian.edu.cn
  const regex = /^\d{11}@stu\.xidian\.edu\.cn$/;
  return regex.test(email);
}

// sending email
export async function sendMail(mail: IHGMailRequest): Promise<SendMailStatus> {
  const { to, subject, body } = mail;
  if (!validateEmail(to)) {
    console.log(`[SMTP] Invalid email ${to}`);
    return SendMailStatus.INVALID_EMAIL;
  }
  const trafficCheckResult = await checkTraffic(mail);
  if (trafficCheckResult !== SendMailStatus._LIMIT_CHECKED) {
    return trafficCheckResult;
  }

  try {
    await transport.sendMail({
      from: env.SMTP_USERNAME,
      to,
      subject,
      text: body,
    });
    console.debug(`[SMTP] Sent mail to ${to}`);
    await storeTraffic(mail);
    return SendMailStatus.OK;
  } catch (e) {
    console.error(e);
    return SendMailStatus.SERVER_ERROR;
  }
}
