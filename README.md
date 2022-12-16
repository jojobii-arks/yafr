# *STILL IN DEVELOPMENT. THIS DOES NOT WORK (yet)*

I just want to code in public to hold myself accountable for this project. 🤣

---

# yafr-replica - Yet Another Fediverse Relay (Replica)

(almost) 1:1 implementation of
[animeirl's fork of pleroma/relay](https://git.pleroma.social/animeirl/relay) in
Deno/Typescript.

*the repo is suffixed with `-replica` since I plan on making another implementation with like, actual workers/message queues and stuff*

## Tech Stack

- Deno: Runtime
- Redis: Data persistence for relay members, recent errors, recent logs, etc.

## Dev Environment

### Requirements

- Deno
- Docker

### Initialization

- `cp .env.example .env` and fill in the required fields.
- Run `docker compose up -d` to run redis server (REDIS_PASSWORD is taken from
  .env, but can be overwritten via environment variable during execution)
- Run `deno task watch` to run the dev server.

---

## Endpoints

### Business Logic

- [ ] `POST /inbox`
- [x] `GET /actor`
- [x] `GET /nodeinfo/2.0.json`
- [x] `GET /.well-known/nodeinfo`
- [x] `GET /.well-known/webfinger`

### Meta

- [ ] `GET /`
  - Default endpoint. Description of relay, list of current subscribers and
    status.
- [ ] `GET /stats`
  - Show off relay stats for debugging purposes, including failure/success rates
    per target instance.
