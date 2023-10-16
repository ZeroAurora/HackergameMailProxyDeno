import { createClient } from "redis";
import { encodeHex } from "std/encoding/hex";
import { IHGMailRequest, SendMailStatus } from "./types.ts";
import { env } from "./env.ts";

// redis config
const client = createClient({url: `redis://${env.REDIS_HOST}:${env.REDIS_PORT}`});

// traffic control using redis
export async function storeTraffic(mail: IHGMailRequest) {
  const redis = await client.connect();

  const contentHash = encodeHex(
    await crypto.subtle.digest("SHA-1", new TextEncoder().encode(mail.body)),
  );
  await redis.setEx(`mails:by-ip:${mail.ip}:${contentHash}`, 60 * 60, "1");
  await redis.setEx(`mails:by-email:${mail.to}:${contentHash}`, 60 * 60, "1");

  await redis.disconnect();
  console.log(`[REDIS|TRAFFIC] Stored traffic for ${mail.to} (${mail.ip})`);
}

export async function checkTraffic(mail: IHGMailRequest) {
  const redis = await client.connect();
  const countByIP = (await redis.keys(`mails:by-ip:${mail.ip}:*`)).length;
  const countByEmail = (await redis.keys(`mails:by-email:${mail.to}:*`)).length;
  redis.disconnect();

  if (countByIP > Number(env.IP_LIMIT)) {
    console.log(`[REDIS|TRAFFIC] IP limit exceeded for ${mail.ip}`);
    return SendMailStatus.IP_LIMIT_EXCEEDED;
  }
  if (countByEmail > Number(env.EMAIL_LIMIT)) {
    console.log(`[REDIS|TRAFFIC] Email limit exceeded for ${mail.to}`);
    return SendMailStatus.EMAIL_LIMIT_EXCEEDED;
  }
  return SendMailStatus._LIMIT_CHECKED;
}
