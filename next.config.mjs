/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@cosmos-kit/web3auth', 'react-syntax-highlighter', 'troika-three-text'],
  reactStrictMode: true,
  images: {
    // Use a custom loader to validate and block malicious patterns
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
    // No specific domain allowlist handled in the loader
    domains: [],
    remotePatterns: [],
    // Additional security settings
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
      {
        source: '/ingest/decide',
        destination: 'https://us.i.posthog.com/decide',
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
