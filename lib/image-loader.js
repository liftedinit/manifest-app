/**
 * Custom Next.js image loader with malicious pattern blocking
 * Validates image URLs against known malicious patterns and suspicious domains
 */

// Malicious patterns to block - focused on high-confidence threats
const MALICIOUS_PATTERNS = {
  // Block obvious malicious TLDs (check domain part, not end of URL)
  suspiciousTlds: /^https?:\/\/[^\/]*\.(tk|ml|ga|cf)(?:\/|$)/i,

  // Block URLs with obvious redirect parameters (more specific)
  suspiciousParams: /[?&](redirect|goto|r)=https?:/i,

  // Block suspicious file extensions in image URLs
  suspiciousExtensions: /\.(exe|bat|cmd|com|pif|scr|vbs|jar|app)$/i,

  // Block suspicious protocols (non-http/https)
  suspiciousProtocols: /^(?!https?:\/\/)/i,

  // Block obvious malicious subdomains (more specific)
  maliciousSubdomains: /^https?:\/\/(?:malware|virus|phishing|scam|hack)\./i,
};

// Additional security checks - relaxed
const SECURITY_CHECKS = {
  // Minimum URL length to prevent single character attacks
  minUrlLength: 8,

  // Maximum URL length to prevent buffer overflow attempts
  maxUrlLength: 4096,
};

/**
 * Validates a URL against malicious patterns
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if URL is safe, false if potentially malicious
 */
function isUrlSafe(url) {
  // Basic validation
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Check URL length
  if (url.length < SECURITY_CHECKS.minUrlLength || url.length > SECURITY_CHECKS.maxUrlLength) {
    return false;
  }

  // Allow local relative paths (start with /)
  if (url.startsWith('/')) {
    // Local paths are generally safe, just check for obvious malicious extensions
    if (MALICIOUS_PATTERNS.suspiciousExtensions.test(url)) {
      console.warn(`Blocked local file with suspicious extension: ${url}`);
      return false;
    }
    return true;
  }

  // For external URLs, check for high-confidence malicious patterns only
  for (const [patternName, pattern] of Object.entries(MALICIOUS_PATTERNS)) {
    if (pattern.test(url)) {
      console.warn(`Blocked potentially malicious URL - Pattern: ${patternName}, URL: ${url}`);
      return false;
    }
  }

  // Validate external URL format
  try {
    new URL(url);
    return true;
  } catch (error) {
    console.warn(`Invalid URL format: ${url}`);
    return false;
  }
}

/**
 * Custom Next.js image loader with security validation
 * @param {Object} params - Loader parameters
 * @param {string} params.src - Source URL
 * @param {number} params.width - Image width
 * @param {number} params.quality - Image quality (defaults to 75)
 * @returns {string} - Validated image URL or fallback
 */
export default function imageLoader({ src, width, quality = 75 }) {
  // Validate the source URL
  if (!isUrlSafe(src)) {
    // Return a fallback image or throw an error
    console.error(`Blocked malicious image URL: ${src}`);
    // You can customize this fallback behavior
    return '/blocked-image-placeholder.svg';
  }

  // For valid URLs, return them as-is or with optimization parameters
  // You can add your own optimization logic here
  return src;
}
