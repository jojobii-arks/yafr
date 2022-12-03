import { RSA } from "https://deno.land/x/god_crypto@v1.4.11/rsa.ts";
import { RSAKey } from "https://deno.land/x/god_crypto@v1.4.11/src/rsa/rsa_key.ts";

/**
 * ! Context
 * https://datatracker.ietf.org/doc/html/draft-cavage-http-signatures-08#appendix-C
 * https://github.dev/misskey-dev/misskey/blob/2037c83541f28f22c072d61fce7096c13e97d845/packages/backend/src/core/remote/activitypub/ApRequestService.ts#L19
 */

// const publicKey = RSA.parseKey(Deno.readTextFileSync("testing/public.pem"));
// const privateKey = RSA.parseKey(Deno.readTextFileSync("testing/private.pem"));
// const privateKeyId = "Test";

type Signed = {
  request: Request;
  signingString: string;
  signature: string;
  signatureHeader: string;
};

export function lcObjectKey(
  src: Record<string, string>,
): Record<string, string> {
  const dst: Record<string, string> = {};
  for (
    const key of Object.keys(src).filter((x) =>
      x !== "__proto__" && typeof src[x] === "string"
    )
  ) dst[key.toLowerCase()] = src[key];
  return dst;
}

export function genSigningString(
  request: Request,
  includeHeaders: string[],
): string {
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

export async function signToRequest(
  request: Request,
  privateKey: RSAKey,
  privateKeyId: string,
  includeHeaders: string[],
): Promise<Signed> {
  const signingString = genSigningString(request, includeHeaders);

  const signature = await new RSA(privateKey).sign(
    signingString,
    {
      hash: "sha256",
      algorithm: "rsassa-pkcs1-v1_5",
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
