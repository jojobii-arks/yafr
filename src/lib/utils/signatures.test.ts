import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { RSA } from "https://deno.land/x/god_crypto@v1.4.11/rsa.ts";
import { signToRequest } from "./signatures.ts";

const url = new URL("https://example.com/foo?param=value&pet=dog#swag");

const request = new Request(url, {
  method: "POST",
  headers: new Headers({
    "Host": url.hostname,
    "Date": "Thu, 05 Jan 2014 21:31:40 GMT",
    "Content-Type": "application/json",
    "Digest": "SHA-256=X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=",
    "Content-Length": "18",
  }),
  body: `{"hello": "world"}`,
});

const privateKeyRaw = `-----BEGIN RSA PRIVATE KEY-----
MIICXgIBAAKBgQDCFENGw33yGihy92pDjZQhl0C36rPJj+CvfSC8+q28hxA161QF
NUd13wuCTUcq0Qd2qsBe/2hFyc2DCJJg0h1L78+6Z4UMR7EOcpfdUE9Hf3m/hs+F
UR45uBJeDK1HSFHD8bHKD6kv8FPGfJTotc+2xjJwoYi+1hqp1fIekaxsyQIDAQAB
AoGBAJR8ZkCUvx5kzv+utdl7T5MnordT1TvoXXJGXK7ZZ+UuvMNUCdN2QPc4sBiA
QWvLw1cSKt5DsKZ8UETpYPy8pPYnnDEz2dDYiaew9+xEpubyeW2oH4Zx71wqBtOK
kqwrXa/pzdpiucRRjk6vE6YY7EBBs/g7uanVpGibOVAEsqH1AkEA7DkjVH28WDUg
f1nqvfn2Kj6CT7nIcE3jGJsZZ7zlZmBmHFDONMLUrXR/Zm3pR5m0tCmBqa5RK95u
412jt1dPIwJBANJT3v8pnkth48bQo/fKel6uEYyboRtA5/uHuHkZ6FQF7OUkGogc
mSJluOdc5t6hI1VsLn0QZEjQZMEOWr+wKSMCQQCC4kXJEsHAve77oP6HtG/IiEn7
kpyUXRNvFsDE0czpJJBvL/aRFUJxuRK91jhjC68sA7NsKMGg5OXb5I5Jj36xAkEA
gIT7aFOYBFwGgQAQkWNKLvySgKbAZRTeLBacpHMuQdl1DfdntvAyqpAZ0lY0RKmW
G6aFKaqQfOXKCyWoUiVknQJAXrlgySFci/2ueKlIE1QqIiLSZ8V8OlpFLRnb1pzI
7U1yQXnTAEFYM560yJlzUpOb1V4cScGd365tiSMvxLOvTA==
-----END RSA PRIVATE KEY-----`;
const privateKey = RSA.parseKey(privateKeyRaw);
const privateKeyId = "Test";

Deno.test({
  name: `RSA signs HTTP Signature correctly`,
  /**
   * ? According to the following test:
   * ? https://datatracker.ietf.org/doc/html/draft-cavage-http-signatures-08#appendix-C.3
   */
  async fn() {
    const signedRequest = await signToRequest(
      request,
      privateKey,
      privateKeyId,
      [
        "(request-target)",
        "host",
        "date",
        "content-type",
        "digest",
        "content-length",
      ],
    );
    const expected =
      `keyId="Test",algorithm="rsa-sha256",headers="(request-target) host date content-type digest content-length",signature="Ef7MlxLXoBovhil3AlyjtBwAL9g4TN3tibLj7uuNB3CROat/9KaeQ4hW2NiJ+pZ6HQEOx9vYZAyi+7cmIkmJszJCut5kQLAwuX+Ms/mUFvpKlSo9StS2bMXDBNjOh4Auj774GFj4gwjS+3NhFeoqyr/MuN6HsEnkvn6zdgfE2i0="`;
    assertEquals(signedRequest.signatureHeader, expected);
  },
});
