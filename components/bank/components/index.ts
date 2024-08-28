export * from "./sendBox";
export * from "./tokenList";
export * from "./historyBox";

export function formatDenom(denom: string): string {
  const cleanDenom = denom.replace(/^factory\/[^/]+\//, "");

  if (cleanDenom.startsWith("u")) {
    return cleanDenom.slice(1).toUpperCase();
  }

  return cleanDenom;
}
