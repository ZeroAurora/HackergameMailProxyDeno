import { IHGMailRequest, IHGResponse, SendMailStatus } from "./types.ts";
import { sendMail } from "./smtp.ts";
import { env } from "./env.ts";

// handler

async function handle(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const auth = req.headers.get("Authorization");
  if (auth !== `Bearer ${env.API_KEY}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const mail: IHGMailRequest = await req.json();
  const sendMailResult = await sendMail(mail);

  let resp: IHGResponse;
  switch (sendMailResult) {
    case SendMailStatus.OK: {
      resp = {
        json: {
          success: true,
          msg: "OK",
        },
        status: 200,
      };
      break;
    }
    case SendMailStatus.INVALID_EMAIL: {
      resp = {
        json: {
          success: false,
          msg:
            "邮件地址无效，仅支持 stu.xidian.edu.cn 域名的 11 位学号邮箱，别名邮箱暂不支持。",
        },
        status: 200,
      };
      break;
    }
    case SendMailStatus.IP_LIMIT_EXCEEDED: {
      resp = {
        json: {
          success: false,
          msg: "超过每小时每 IP 最大发送限制，请稍后再试。",
        },
        status: 200,
      };
      break;
    }
    case SendMailStatus.EMAIL_LIMIT_EXCEEDED: {
      resp = {
        json: {
          success: false,
          msg: "超过每小时每邮箱最大发送限制，请稍后再试。",
        },
        status: 200,
      };
      break;
    }
    case SendMailStatus.SERVER_ERROR: {
      resp = {
        json: {
          success: false,
          msg: "发送失败，请联系西电方面管理员。",
        },
        status: 200,
      };
      break;
    }
    default: {
      resp = {
        json: {
          success: false,
          msg: "未知错误。",
        },
        status: 500,
      };
    }
  }
  console.debug(resp);
  return new Response(JSON.stringify(resp.json), {
    status: resp.status,
  });
}

// server

Deno.serve(async (req) => {
  const path = new URL(req.url).pathname;
  switch (path) {
    case "/":
      return await handle(req);
    default:
      return new Response("Not Found", { status: 404 });
  }
});
