export function splitSignature(signature: string): {
  headers: string[];
  algorithm: string;
} {
  const splitted = signature.trim().split(",");
  const reduced = splitted.reduce(
    (chunks: { [key: string]: string }, chunk) => {
      const chunkSplit = chunk.split(`=`);
      const chunkParts = chunkSplit.map((e) => e);
      if (!chunkParts[1].startsWith(`"`) || !chunkParts[1].endsWith(`"`)) {
        throw new Error("Signature's syntax is invalid");
      }
      chunks[chunkParts[0]] = chunkParts[1].substring(
        1,
        chunkParts[1].length - 1,
      );
      return chunks;
    },
    {},
  );
  if (!reduced.algorithm) {
    throw new Error("Signature does not contain algorithm field.");
  }
  return {
    algorithm: reduced.algorithm,
    headers: reduced.headers ? reduced.headers.split(" ") : ["date"],
  };
}

export function buildSigningString(headers: Headers) {
  const headerStringArray = [];
  headers.forEach((value, key) => {
    headerStringArray.push(key.toLowerCase() + ": " + value);
  });
  headerStringArray.push(headers.keys);
  headerStringArray.flat().join("\n");
}
