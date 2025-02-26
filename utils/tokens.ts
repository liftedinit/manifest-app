export type TokenBase = string & { __tokenBase: never };

/**
 * The token base for MFX.
 */
export const MFX_TOKEN_BASE: TokenBase = 'umfx' as TokenBase;

/**
 * Converts the given token base to a string. The token must be validated another
 * way before using this function.
 * @param tokenBase The token base to convert.
 * @returns The token base as a `TokenBase` type.
 */
export function unsafeConvertTokenBase(tokenBase: string): TokenBase {
  return tokenBase as TokenBase;
}

/**
 * Returns the token base of the given token.
 * @param tokenBase The token base to check.
 */
export function isMfxToken(tokenBase: TokenBase): boolean {
  return tokenBase === MFX_TOKEN_BASE;
}
