export function splitSignature(signature: string): {
  headers: string[];
  algorithm: string;
} {
  const splitted = signature.trim().split(",");
  const mapped = splitted.reduce((chunks: { [key: string]: string }, chunk) => {
    const chunkSplit = chunk.split(`=`);
    const chunkParts = chunkSplit.map((e) => e.substring(1, e.length - 1));
    chunks[chunkParts[0]] = chunkParts[1];
    return chunks;
  }, {});
  if (!mapped.algorithm) {
    throw new Error("Signature does not contain algorithm field.");
  }
  return {
    algorithm: mapped.algorithm,
    headers: mapped.headers ? mapped.headers.split(" ") : ["date"],
  };
}
