import { RSA } from "https://deno.land/x/god_crypto@v1.4.11/rsa.ts";
import { RSAKey } from "https://deno.land/x/god_crypto@v1.4.11/src/rsa/rsa_key.ts";

const publicKey = RSA.parseKey(Deno.readTextFileSync("testing/public.pem"));
const privateKey = RSA.parseKey(Deno.readTextFileSync("testing/private.pem"));
const privateKeyId = "Test";

type Signed = {
  request: Request;
  signingString: string;
  signature: string;
  signatureHeader: string;
};

function lcObjectKey(src: Record<string, string>): Record<string, string> {
  const dst: Record<string, string> = {};
  for (
    const key of Object.keys(src).filter((x) =>
      x !== "__proto__" && typeof src[x] === "string"
    )
  ) dst[key.toLowerCase()] = src[key];
  return dst;
}

function genSigningString(request: Request, includeHeaders: string[]): string {
  const parsedHeaders = lcObjectKey(
    Object.fromEntries(request.headers.entries()),
  );

  const results: string[] = [];

  for (const key of includeHeaders.map((x) => x.toLowerCase())) {
    if (key === "(request-target)") {
      results.push(
        `(request-target): ${request.method.toLowerCase()} ${
          new URL(request.url).pathname + new URL(request.url).search
        }`,
      );
    } else {
      results.push(`${key}: ${parsedHeaders[key]}`);
    }
  }

  return results.join("\n");
}

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

const signingString = genSigningString(
  request,
  ["(request-target)", "date", "host"],
);

console.log(signingString);

async function signToRequest(
  request: Request,
  privateKey: RSAKey,
  privateKeyId: string,
  includeHeaders: string[],
): Promise<Signed> {
  const signingString = genSigningString(request, includeHeaders);

  const signature = await new RSA(privateKey).sign(
    new Uint8Array(signingString as unknown as ArrayBufferLike),
    {
      hash: "sha256",
    },
  ).then((raw) => raw.base64());
  const signatureHeader =
    `keyId="${privateKeyId}",algorithm="rsa-sha256",headers="${
      includeHeaders.join(" ")
    }",signature="${signature}"`;

  const newHeaders = new Headers({
    ...Object.fromEntries(request.headers.entries()),
    Signature: signatureHeader,
  });

  const newRequest: Request = new Request(request.url, {
    ...request,
    headers: newHeaders,
  });

  return {
    request: newRequest,
    signingString,
    signature,
    signatureHeader,
  };
}

const signedRequest = await signToRequest(request, privateKey, privateKeyId, [
  "(request-target)",
  "host",
  "date",
]);

console.log(signedRequest.request.headers.get("Signature"));
