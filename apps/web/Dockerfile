# Stage 1: Dependencies
FROM node:24-alpine AS deps
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/supabase/package.json ./packages/supabase/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:24-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Build-time arguments (passed from Railway or CI)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_DATAFAST_ID

# Make build args available as env vars during build
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_DATAFAST_ID=$NEXT_PUBLIC_DATAFAST_ID

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

# Copy source files
COPY . .

# Build the application
RUN pnpm --filter @icemap/web build

# Stage 3: Runner
FROM node:24-alpine AS runner
WORKDIR /app

# Install FFmpeg and ImageMagick for media processing
RUN apk add --no-cache ffmpeg imagemagick

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

# Railway sets PORT dynamically, default to 8080
EXPOSE 8080

ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Runtime environment variables (set by Railway)
# SUPABASE_URL - Server-side Supabase URL
# SUPABASE_SERVICE_ROLE_KEY - Server-side service key
# NEXT_PUBLIC_* vars are baked in at build time

CMD ["node", "apps/web/server.js"]
