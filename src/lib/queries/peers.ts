import redis from "redis";
export async function getPeers() {
  const x = await redis.zrange("relay-list", 0, -1);
  return x.map((inbox) => {
    return new URL(inbox).hostname;
  });
}
