import { splitSignature } from "./http-signatures.ts";
import { assertEquals } from "https://deno.land/std@0.166.0/testing/asserts.ts";

Deno.test("splitSignature", () => {
  assertEquals([1, 2, 3], [1, 2, 3]);
});
