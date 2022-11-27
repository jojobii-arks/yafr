# yafr-replica - Yet Another Fediverse Relay (Replica)

1:1 implementation of [animeirl's fork of pleroma/relay](https://git.pleroma.social/animeirl/relay) in Deno/Typescript.

## Tech Stack

- Deno: Runtime
- Redis: Data persistence for relay members, recent errors, recent logs, etc.

## Endpoints

### Meta

- `GET /`
  - Default endpoint. Description of relay, list of current subscribers and status.
- `GET /stats`
  - Show off relay stats for debugging purposes, including failure/success rates per target instance.

### Business Logic

- `GET /actor`
- `GET /inbox`
- `GET /nodeinfo/2.0.json`
- `GET /.well-known/nodeinfo`
- `GET /.well-known/webfinger`