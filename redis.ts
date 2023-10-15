import { connect, RedisConnectOptions } from "redis";
import { encodeHex } from "std/encoding/hex";
import { IHGMailRequest, SendMailStatus } from "./types.ts";
import { env } from "./env.ts";

// redis config
const redisConfig: RedisConnectOptions = {
  hostname: env.REDIS_HOST,
  port: Number(env.REDIS_PORT),
};

// traffic control using redis
export async function storeTraffic(mail: IHGMailRequest) {
  const redis = await connect(redisConfig);

  const contentHash = encodeHex(
    await crypto.subtle.digest("SHA-1", new TextEncoder().encode(mail.body)),
  );
  await redis.setex(`mails:by-ip:${mail.ip}:${contentHash}`, 60 * 60, "1");
  await redis.setex(`mails:by-email:${mail.to}:${contentHash}`, 60 * 60, "1");

  redis.close();
  console.log(`[REDIS|TRAFFIC] Stored traffic for ${mail.to} (${mail.ip})`);
}

export async function checkTraffic(mail: IHGMailRequest) {
  const redis = await connect(redisConfig);
  const countByIP = (await redis.keys(`mails:by-ip:${mail.ip}:*`)).length;
  const countByEmail = (await redis.keys(`mails:by-email:${mail.to}:*`)).length;
  redis.close();

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
