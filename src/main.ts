import "https://deno.land/std@0.166.0/dotenv/load.ts";
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import redis from "redis";

const app = new Application();

/** ----- */

const router = new Router();

router.get("/", async (ctx) => {
  ctx.response.body = await redis.ping();
});

router.get("/stats", async (ctx) => {
  // TODO: implement `GET /stats` endpoint
  ctx.response.body = await redis.ping();
});

router.get("/nodeinfo/2.0.json", async (ctx) => {
  // TODO: implement `GET /nodeinfo/2.0.json` endpoint
  ctx.response.body = await redis.ping();
});

router.get("/.well-known/nodeinfo", async (ctx) => {
  // TODO: implement `GET /.well-known/nodeinfo` endpoint
  ctx.response.body = await redis.ping();
});

router.get("/.well-known/webfinger", async (ctx) => {
  // TODO: implement `GET /.well-known/webfinger` endpoint
  ctx.response.body = await redis.ping();
});

router.get("/actor", async (ctx) => {
  // TODO: implement `GET /actor` endpoint
  ctx.response.body = await redis.ping();
});

router.post("/inbox", async (ctx) => {
  // TODO: implement `POST /inbox` endpoint
  ctx.response.body = await redis.ping();
});

app.use(router.routes());
app.use(router.allowedMethods());

/** ----- */

app.addEventListener("listen", ({ hostname, port, secure }) => {
  console.log(
    `Listening on: ${secure ? "https://" : "http://"}${
      hostname ??
        "localhost"
    }:${port}`,
  );
});

await app.listen({
  port: 3000,
});
