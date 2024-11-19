# syntax=docker.io/docker/dockerfile:1

FROM oven/bun:slim AS base
RUN --mount=type=secret,id=ably_api_key,env=NEXT_PUBLIC_ABLY_API_KEY \
    --mount=type=secret,id=walletconnect_key,env=NEXT_PUBLIC_WALLETCONNECT_KEY \
    --mount=type=secret,id=web3auth_key,env=NEXT_PUBLIC_WEB3_CLIENT_ID

ARG NEXT_PUBLIC_CHAIN
ARG NEXT_PUBLIC_CHAIN_ID
ARG NEXT_PUBLIC_TESTNET_CHAIN_ID
ARG NEXT_PUBLIC_MAINNET_RPC_URL
ARG NEXT_PUBLIC_TESTNET_RPC_URL
ARG NEXT_PUBLIC_MAINNET_API_URL
ARG NEXT_PUBLIC_TESTNET_API_URL

ENV NEXT_PUBLIC_CHAIN=${NEXT_PUBLIC_CHAIN}
ENV NEXT_PUBLIC_CHAIN_ID=${NEXT_PUBLIC_CHAIN_ID}
ENV NEXT_PUBLIC_TESTNET_CHAIN_ID=${NEXT_PUBLIC_TESTNET_CHAIN_ID}
ENV NEXT_PUBLIC_MAINNET_RPC_URL=${NEXT_PUBLIC_MAINNET_RPC_URL}
ENV NEXT_PUBLIC_TESTNET_RPC_URL=${NEXT_PUBLIC_TESTNET_RPC_URL}
ENV NEXT_PUBLIC_MAINNET_API_URL=${NEXT_PUBLIC_MAINNET_API_URL}
ENV NEXT_PUBLIC_TESTNET_API_URL=${NEXT_PUBLIC_TESTNET_API_URL}

RUN echo Base: $NEXT_PUBLIC_CHAIN
RUN echo Base: $NEXT_PUBLIC_CHAIN_ID
RUN echo Base: $NEXT_PUBLIC_TESTNET_CHAIN_ID
RUN echo Base: $NEXT_PUBLIC_MAINNET_RPC_URL
RUN echo Base: $NEXT_PUBLIC_TESTNET_RPC_URL
RUN echo Base: $NEXT_PUBLIC_MAINNET_API_URL
RUN echo Base: $NEXT_PUBLIC_TESTNET_API_URL


# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* bun.lockb ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  elif [ -f bun.lockb ]; then bun install --no-save; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

RUN echo Builder: $NEXT_PUBLIC_CHAIN
RUN echo Builder: $NEXT_PUBLIC_CHAIN_ID
RUN echo Builder: $NEXT_PUBLIC_TESTNET_CHAIN_ID
RUN echo Builder: $NEXT_PUBLIC_MAINNET_RPC_URL
RUN echo Builder: $NEXT_PUBLIC_TESTNET_RPC_URL
RUN echo Builder: $NEXT_PUBLIC_MAINNET_API_URL
RUN echo Builder: $NEXT_PUBLIC_TESTNET_API_URL

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  elif [ -f bun.lockb ]; then bun run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
