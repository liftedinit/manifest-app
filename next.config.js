/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@cosmos-kit/web3auth', 'react-syntax-highlighter', 'troika-three-text'],
  reactStrictMode: true,
  images: {
    // Use a custom loader to validate and block malicious patterns
    loader: 'custom',
    loaderFile: './lib/image-loader.js',
    // No specific domain allowlist handled in the loader
    domains: [],
    remotePatterns: [],
    // Additional security settings
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

module.exports = nextConfig;
