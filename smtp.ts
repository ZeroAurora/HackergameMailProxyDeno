import { ClientOptions, SMTPClient } from "denomailer";
import { env } from "./env.ts";
import { IHGMailRequest, SendMailStatus } from "./types.ts";
import { checkTraffic, storeTraffic } from "./redis.ts";

// email client config
const smtpConfig: ClientOptions = {
  debug: {
    allowUnsecure: true,
    noStartTLS: true,
  },
  connection: {
    hostname: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    auth: {
      username: env.SMTP_USERNAME,
      password: env.SMTP_PASSWORD,
    },
  },
};

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

  let smtp: SMTPClient | undefined;
  try {
    smtp = new SMTPClient(smtpConfig);
    await smtp.send({
      from: env.SMTP_USERNAME,
      to,
      subject,
      content: body,
    });
    console.debug(`[SMTP] Sent mail to ${to}`);
    await storeTraffic(mail);
    return SendMailStatus.OK;
  } catch (e) {
    console.error(e);
    return SendMailStatus.SERVER_ERROR;
  } finally {
    await smtp?.close();
  }
}
