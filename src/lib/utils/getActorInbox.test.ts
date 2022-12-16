import { assertThrows } from "https://deno.land/std@0.152.0/testing/asserts.ts";
import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";

import getActorInbox from "./getActorInbox.ts";

/** From https://relay.homunyan.com/actor */
const exampleActor = {
  "@context": "https://www.w3.org/ns/activitystreams",
  "endpoints": {
    "sharedInbox": "https://relay.homunyan.com/inbox",
  },
  "followers": "https://relay.homunyan.com/followers",
  "following": "https://relay.homunyan.com/following",
  "inbox": "https://relay.homunyan.com/inbox",
  "name": "ActivityRelay",
  "type": "Application",
  "id": "https://relay.homunyan.com/actor",
  "publicKey": {
    "id": "https://relay.homunyan.com/actor#main-key",
    "owner": "https://relay.homunyan.com/actor",
    "publicKeyPem":
      "-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAtEG98SCR8kJD0DerzRVG\nwHp546M7dn/e4kyHo3sd3a7Ft6J+NTFFfg91vLRlnBVmKzab6pLECj5QgHi/ERBM\nvCnB6yNNee+v/37uhsrMeyI8ET7abHAEyNgR5GUp6yxYctieK9Y7NNoeXrkDlto4\nTITUykkJPSD35cYFy2neVNgJ+YlJd6txfmg/7C+I1lR2bPERjOGenJnMMtUcGU4Y\nFz5qwA6QoJxZm0PaoY1hIR9PEY6cz3Z8le+4IalzTQ4PmF5ZyADURjVhbdwXm8ql\nMNb84PP9dPXIpLPemr/RbbdMi6jZ7KMMtyLKc8t6h0MIrZSXvi7oOy5HZXZMWLr4\nrAoSwnEPVSJXVVJuM+kjI93kTkRLT1VNZ/56IH/Q/K3MwVm0HxBgbd4BPi+paWm/\nQwmlT5rAUURmL8GVmuGopzAKJTsPoqNSCAfU37io2jx+E1XGR4NdH2+6sMoVIyMb\nYjC19M7zigMzDGSUbj7/hyw+0P7xITZQR+glSObRXxmtljocJ0hD0SfFp1WF9hnR\nilUlufKe5TkPYNkYUTY0uq6npCOVAdoJp+/Iw4NhA3rD812Vt1pq2aYzY63uyUgc\ny0xhhiFUOoIJjhuQcsnSRRAIe0nUsCFXCxb1tEQTB0QzcX8pq/ihDJimjJMviP5A\nrF+KB+KGXpM32zI8rwgF8hsCAwEAAQ==\n-----END PUBLIC KEY-----",
  },
  "summary": "ActivityRelay bot",
  "preferredUsername": "relay",
  "url": "https://relay.homunyan.com/actor",
};

const { endpoints: _endpoints, ...exampleActorWithoutEndpoints } = exampleActor;

Deno.test("getActorInbox", () => {
  getActorInbox;
});

Deno.test("getActorInbox - gets from endpoints array", () => {
  assertEquals(
    getActorInbox(exampleActor),
    "https://relay.homunyan.com/inbox",
  );
});

Deno.test("getActorInbox - falls back to inbox property", () => {
  assertEquals(
    getActorInbox(exampleActorWithoutEndpoints),
    "https://relay.homunyan.com/inbox",
  );
});

Deno.test("getActorInbox - throws on invalid Actor", () => {
  assertThrows(() => {
    getActorInbox({ swag: "epic" });
  });
});
