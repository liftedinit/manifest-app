import { CombinedBalanceInfo } from './types';

export function truncateString(str: string, prefixLen: number = 6, suffixLen: number = 6): string {
  if (str.length <= prefixLen + suffixLen) return str;

  return str.slice(0, prefixLen) + '...' + str.slice(-suffixLen);
}

/**
 * Truncate an address to show the prefix + first 4 characters + ... + last 4 characters
 * This ensures the prefix is always visible and the truncation happens in the middle
 * @param address The address to truncate
 * @returns Truncated address with format: prefix + first4 + ... + last4
 */
export function truncateAddress(address: string | null | undefined) {
  if (address == null) {
    console.warn('unable to truncate undefined/null address');
    return '';
  }

  // Find the prefix (everything before the first '1' character in bech32 addresses)
  const prefixMatch = address.match(/^([a-z]+)1/);
  if (!prefixMatch) {
    // Fallback for non-bech32 addresses: show first 4 + ... + last 4
    if (address.length <= 12) return address;
    return address.slice(0, 4) + '...' + address.slice(-4);
  }

  const prefix = prefixMatch[0]; // includes the '1'
  const addressBody = address.slice(prefix.length);

  // If the address body is short enough, show the full address
  if (addressBody.length <= 12) return address;

  // Show prefix + first 4 + ... + last 4 of the address body
  return prefix + addressBody.slice(0, 4) + '...' + addressBody.slice(-4);
}

export function secondsToHumanReadable(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  if (remainingSeconds > 0 || parts.length === 0)
    parts.push(`${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`);

  return parts.join(' ');
}

export function isValidManifestAddress(value: string): boolean {
  return /^manifest[a-zA-Z0-9]{32,}$/.test(value);
}

export const formatTokenDisplayName = (token: {
  metadata?: CombinedBalanceInfo;
  denom?: string;
}) => {
  const tokenDisplayName = token?.metadata?.metadata?.display ?? token?.denom ?? '';
  return tokenDisplayName.startsWith('factory')
    ? tokenDisplayName.split('/').pop()?.toUpperCase()
    : truncateString(tokenDisplayName, 10).toUpperCase();
};

export const formatTokenDisplay = (display: string) => {
  if (display.startsWith('factory')) {
    const token = display.split('/').pop() || '';
    return token.length > 9 ? `${token.slice(0, 5)}...`.toUpperCase() : token.toUpperCase();
  }
  return display.length > 9 ? `${display.slice(0, 5)}...` : truncateString(display, 12);
};
