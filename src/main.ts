import "https://deno.land/std@0.166.0/dotenv/load.ts";
import redis from "redis";

console.log(await redis.ping());
