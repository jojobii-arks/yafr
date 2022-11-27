import "https://deno.land/std@0.166.0/dotenv/load.ts";
import {
  Application,
  createHttpError,
  isHttpError,
  Request,
  Router,
} from "https://deno.land/x/oak@v11.1.0/mod.ts";
import redis from "redis";

const app = new Application();
const appVersion = "0.1";

/** Error Catching */
app.use(async (context, next) => {
  try {
    await next();
  } catch (err) {
    if (isHttpError(err)) {
      context.response.status = err.status;
    } else {
      context.response.status = 500;
    }
    context.response.body = err.message;
    context.response.type = "application/json";
  }
});

/**
 * Parse the request's body as JSON. Throw an error if it's invalid.
 * @param request - `request` property of Context object.
 */
async function parseJsonBody(
  request: Request,
  // deno-lint-ignore no-explicit-any
): Promise<{ [key: string]: any }> {
  const contentType = request.headers.get("Content-Type");
  if (
    contentType === "application/json" ||
    contentType === "application/activity+json"
  ) {
    try {
      console.log("hi");
      return await request.body({ type: "json" }).value;
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw createHttpError(
          400,
          JSON.stringify({
            error: "invalid JSON syntax",
            details: err.message,
          }),
        );
      } else throw err;
    }
  }
  // If some edge-case isn't catched, just return an empty object.
  return {};
}

/** ----- */

const router = new Router();

//! Business Logic for MVP

router.get("/actor", async ({ request, response }) => {
  // TODO: implement `GET /actor` endpoint
  response.body = await redis.ping();
});

router.post("/inbox", async ({ request, response }) => {
  // TODO: implement `POST /inbox` endpoint
  const jsonBody = await parseJsonBody(request);
  console.log(jsonBody);
  response.body = jsonBody;
});

router.get("/nodeinfo/2.0.json", async ({ request, response }) => {
  // TODO: implement `GET /nodeinfo/2.0.json` endpoint
  const nodeInfo = {
    openRegistrations: true,
    protocols: ["activitypub"],
    services: { inbound: [], outbound: [] },
    software: { name: "yafr-replica", "version": appVersion },
    usage: { localPosts: 0, users: { total: 1 } },
    version: "2.0",
    metadata: {
      peers: [
        // TODO: fetch all peers from DB.
      ],
    },
  };
  response.body = await redis.ping();
});

router.get("/.well-known/nodeinfo", async ({ request, response }) => {
  // TODO: implement `GET /.well-known/nodeinfo` endpoint
  response.body = await redis.ping();
});

router.get("/.well-known/webfinger", async ({ request, response }) => {
  // TODO: implement `GET /.well-known/webfinger` endpoint
  response.body = await redis.ping();
});

//!

router.get("/", async ({ request, response }) => {
  // TODO: implement `GET /` endpoint
  response.body = await redis.ping();
});

router.get("/stats", async ({ request, response }) => {
  // TODO: implement `GET /stats` endpoint
  response.body = await redis.ping();
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
