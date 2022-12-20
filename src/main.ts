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

// ? Business Logic for MVP

router.post("/inbox", async ({ request, response }) => {
  // TODO: implement `POST /inbox` endpoint
  const jsonBody = await parseJsonBody(request);
  console.log(jsonBody);
  response.body = jsonBody;
});

router.get("/actor", async ({ request, response }) => {
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

router.get("/nodeinfo/2.0.json", async ({ response }) => {
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
      // TODO: ensure peers are properly formatted
      peers: await getPeers(),
      staffAccounts: metadata.staffAccounts,
    },
  });
  response.body = nodeInfo;
  response.type = contentType("json");
});

router.get("/.well-known/nodeinfo", ({ request, response }) => {
  const wellKnownNodeInfo = {
    links: [
      {
        "rel": "http://nodeinfo.diaspora.software/ns/schema/2.0",
        "href": `https://${request.url.host}/nodeinfo/2.0.json`,
      },
    ],
  };
  response.body = wellKnownNodeInfo;
  response.type = contentType("json");
});

router.get("/.well-known/webfinger", ({ request, response }) => {
  const subject = request.url.searchParams.get("resource");
  if (!subject) throw createHttpError(400);
  if (subject !== `acct:relay@${request.url.host}`) {
    throw createHttpError(404, "User Not Found");
  }
  const actorUri = `https://${request.url.host}/actor`;
  const wf = WellKnown.defineWebFinger({
    aliases: [actorUri],
    links: [
      { "href": actorUri, "rel": "self", "type": "application/activity+json" },
      {
        "href": actorUri,
        "rel": "self",
        "type":
          'application/ld+json; profile="https://www.w3.org/ns/activitystreams"',
      },
    ],
    subject: subject,
  });
  response.body = wf;
});

// ? Frontend for consumers.

router.get("/", async ({ response }) => {
  // TODO: implement `GET /` endpoint
  response.body = await redis.ping();
});

router.get("/stats", async ({ response }) => {
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
