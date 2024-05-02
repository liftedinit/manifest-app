/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: [
    "@cosmos-kit/leap-social-login",
    "@leapwallet/capsule-web-sdk-lite",
    "@leapwallet/cosmos-social-login-capsule-provider",
    "@cosmos-kit/leap-capsule-social-login",
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
