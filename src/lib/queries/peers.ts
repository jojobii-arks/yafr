import redis, { Key } from "redis";
export async function getPeers() {
  const x = await redis.zrange(Key.PEERS, 0, -1);
  return x.map((inbox) => {
    return new URL(inbox).hostname;
  });
}
