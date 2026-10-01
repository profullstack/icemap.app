# syntax=docker/dockerfile:1
# icemap.app on Bun. dev2's compose builds THIS path (apps/web/Dockerfile)
# with the repo root as context; keep it here.
#
# Alpine throughout, as under Node: the media upload route shells out to
# ffmpeg and ImageMagick 7, and alpine:3.24 keeps the versions prod ran on
# node:24-alpine (ffmpeg 8.1, ImageMagick 7.1.2). oven/bun:*-alpine is 3.22
# (ffmpeg 6.1) and Debian slim is twice the image, so the runtime stage is
# alpine:3.24 with Bun's musl binary copied in.

# Stage 1: dependencies (whole workspace, so /app is copied as one tree)
FROM oven/bun:1.4.0-alpine AS deps
WORKDIR /app
COPY package.json bun.lock bunfig.toml ./
COPY apps/web/package.json ./apps/web/
COPY packages/supabase/package.json ./packages/supabase/
RUN bun install --frozen-lockfile

# Stage 2: build
FROM deps AS build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_* are inlined at build time. dev2's compose passes the first
# two; the rest were Railway's and stay declared for parity.
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_VAPID_PUBLIC_KEY
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_DATAFAST_ID
RUN bun run build

# Stage 3: runtime
FROM alpine:3.24 AS runtime
RUN apk add --no-cache libstdc++ libgcc ffmpeg imagemagick \
 && addgroup -S -g 1000 bun && adduser -S -D -u 1000 -G bun -h /home/bun bun
COPY --from=deps /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=8080
# Docker sets HOSTNAME to the container id; the standalone server binds to it.
ENV HOSTNAME=0.0.0.0
COPY --from=build --chown=bun:bun /app/apps/web/.next/standalone ./
COPY --from=build --chown=bun:bun /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=bun:bun /app/apps/web/public ./apps/web/public
USER bun
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD bun -e "fetch('http://127.0.0.1:'+(process.env.PORT||8080)+'/').then(r=>process.exit(r.status<500?0:1)).catch(()=>process.exit(1))"
CMD ["bun", "apps/web/server.js"]
