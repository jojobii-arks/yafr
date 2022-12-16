import "https://deno.land/std@0.166.0/dotenv/load.ts";
import {
  Application,
  createHttpError,
  isHttpError,
  Request,
  Router,
} from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { ActivityPub, WellKnown } from "npm:@musakui/fedi@0.0.11";
import { contentType } from "https://deno.land/std@0.152.0/media_types/mod.ts";
import redis from "redis";
import { getPeers } from "./lib/queries/peers.ts";

const { CONTENT_TYPE: ACTIVITY_JSON_TYPE } = ActivityPub;

const app = new Application();
const metadata = {
  softwareName: "yafr-replica",
  appVersion: "0.1",
  repository: "https://github.com/jojobii-arks/yafr-replica",
  staffAccounts: [
    "https://mk.arks.cafe/@jojobii",
  ],
};

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
  const actor = {
    "@context": "https://www.w3.org/ns/activitystreams",
    "endpoints": { "sharedInbox": `https://${request.url.host}/inbox"` },
    "followers": `https://${request.url.host}/followers`,
    "following": `https://${request.url.host}/following`,
    "inbox": `https://${request.url.host}/inbox`,
    "name": "ActivityRelay",
    "type": "Application",
    "id": `https://${request.url.host}/actor`,
    "publicKey": {
      "id": `https://${request.url.host}/actor#main-key`,
      "owner": `https://${request.url.host}/actor`,
      "publicKeyPem": Deno.env.get("PUBLIC_KEY_PEM"),
    },
    "summary": "ActivityRelay bot",
    "preferredUsername": "relay",
    "url": `https://${request.url.host}/actor`,
  };
  await redis.ping();
  response.body = actor;
  response.type = ACTIVITY_JSON_TYPE;
});

router.post("/inbox", async ({ request, response }) => {
  // TODO: implement `POST /inbox` endpoint
  const jsonBody = await parseJsonBody(request);
  console.log(jsonBody);
  response.body = jsonBody;
});

router.get("/nodeinfo/2.0.json", async ({ request, response }) => {
  // TODO: implement `GET /nodeinfo/2.0.json` endpoint
  const nodeInfo = WellKnown.defineNodeInfo({
    openRegistrations: true,
    protocols: ["activitypub"],
    services: { inbound: [], outbound: [] },
    software: {
      name: metadata.softwareName,
      version: metadata.appVersion,
      repository: metadata.repository,
    },
    usage: { localPosts: 0, users: { total: 1 } },
    version: "2.0",
    metadata: {
      peers: await getPeers(),
      staffAccounts: metadata.staffAccounts,
    },
  });
  await redis.ping();
  response.body = nodeInfo;
  response.type = contentType("json");
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
