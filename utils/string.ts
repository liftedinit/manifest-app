import { CombinedBalanceInfo } from './types';

export function truncateString(str: string, prefixLen: number = 6, suffixLen: number = 6): string {
  if (str.length <= prefixLen + suffixLen) return str;

  return str.slice(0, prefixLen) + '...' + str.slice(-suffixLen);
}

export function truncateAddress(address: string, num: number = 24) {
  if (address === null || address === undefined) {
    console.warn('unable to truncate undefined/null address');
    return '';
  }
  if (address.length <= num) return address;

  return address.slice(0, num) + '...';
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
