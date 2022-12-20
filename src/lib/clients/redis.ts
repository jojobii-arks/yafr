import { connect } from "https://deno.land/x/redis@v0.27.4/mod.ts";

export enum Key {
  PEERS = "peers",
}

const env = Deno.env.toObject();
const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = env;

/** Check environment for required variables. */
if (
  REDIS_HOST === undefined ||
  REDIS_PORT === undefined ||
  REDIS_PASSWORD === undefined
) {
  const attemptedEnv = {
    REDIS_HOST,
    REDIS_PORT,
    REDIS_PASSWORD,
  };
  console.log(attemptedEnv);
  throw new Error(`Environment Variables are not properly configured.`, {
    cause: attemptedEnv,
  });
}

console.log("Connecting to Redis Server...");

const redis = await connect(
  {
    hostname: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
  },
);

/** Audit database types prior to export. */
if (await redis.type(Key.PEERS) !== "zset") await redis.del(Key.PEERS);

export default redis;
