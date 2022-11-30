import { RSA } from "https://deno.land/x/god_crypto@v1.4.11/rsa.ts";

const publicKey = RSA.parseKey(Deno.readTextFileSync("testing/public.pem"));
const privateKey = RSA.parseKey(Deno.readTextFileSync("testing/private.pem"));

const cipher = await new RSA(publicKey).encrypt("Hello World", {
  hash: "sha256",
});
console.log(cipher.base64());

const plain = await new RSA(privateKey).decrypt(cipher, { hash: "sha256" });
console.log(plain.toString());
