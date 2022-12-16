import redis from "redis";
export async function getPeers() {
  return await redis.zrange("peers", 0, -1);
}
