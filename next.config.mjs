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
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
    const posthogAssetsHost =
      process.env.NEXT_PUBLIC_POSTHOG_ASSETS_HOST || 'https://us-assets.i.posthog.com';

    return [
      {
        source: '/ingest/static/:path*',
        destination: `${posthogAssetsHost}/static/:path*`,
      },
      {
        source: '/ingest/decide',
        destination: `${posthogHost}/decide`,
      },
      {
        source: '/ingest/:path*',
        destination: `${posthogHost}/:path*`,
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
