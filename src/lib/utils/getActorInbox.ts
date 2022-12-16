// deno-lint-ignore no-explicit-any
export default function getActorInbox(actor: any) {
  const x = actor?.endpoints?.sharedInbox ?? actor.inbox;
  if (typeof x !== "string") {
    throw new Error("Unable to grab actor from object.", { cause: actor });
  }
  return x;
}
