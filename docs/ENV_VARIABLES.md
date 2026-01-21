# Environment Variables

This document describes all environment variables needed for icemap.app. Copy the content below to `.env.example` and `.env.local`.

## .env.example Content

```env
# ===========================================
# icemap.app Environment Variables
# ===========================================
# Copy this file to .env.local for development
# Set these in Railway dashboard for production

# -------------------------------------------
# Supabase Configuration (SERVER-SIDE ONLY)
# -------------------------------------------
# Get these from your Supabase project settings
# NEVER expose these to the client!
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# -------------------------------------------
# Push Notifications (VAPID Keys)
# -------------------------------------------
# Generate with: npx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key

# -------------------------------------------
# Application Configuration
# -------------------------------------------
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# -------------------------------------------
# Map Configuration (Optional)
# -------------------------------------------
# If using Mapbox instead of OpenStreetMap
# NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-access-token

# Default map center (lat,lng) - defaults to US center if not set
# NEXT_PUBLIC_DEFAULT_LAT=39.8283
# NEXT_PUBLIC_DEFAULT_LNG=-98.5795
# NEXT_PUBLIC_DEFAULT_ZOOM=4

# -------------------------------------------
# Rate Limiting Configuration
# -------------------------------------------
# Time in seconds between allowed posts (default: 3600 = 1 hour)
RATE_LIMIT_WINDOW_SECONDS=3600

# -------------------------------------------
# Media Processing Configuration
# -------------------------------------------
# Maximum file size in bytes (default: 500MB)
MAX_FILE_SIZE_BYTES=524288000

# Maximum number of media items per post
MAX_MEDIA_PER_POST=5

# Video quality settings for FFmpeg
VIDEO_BITRATE=1000k
VIDEO_MAX_WIDTH=1280
VIDEO_MAX_HEIGHT=720

# Image quality settings
IMAGE_QUALITY=80
IMAGE_MAX_WIDTH=1920
IMAGE_MAX_HEIGHT=1080

# -------------------------------------------
# Post Configuration
# -------------------------------------------
# Time in hours before posts are auto-deleted (default: 168 = 7 days)
POST_TTL_HOURS=168

# -------------------------------------------
# Admin Configuration
# -------------------------------------------
# Email address for report notifications
ADMIN_EMAIL=admin@icemap.app

# SMTP settings for sending report emails
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=noreply@icemap.app
```

## Variable Descriptions

### Supabase Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key for server-side access (never expose to client) |

### Push Notifications

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Yes | VAPID public key for web push |
| `VAPID_PRIVATE_KEY` | Yes | VAPID private key (server-side only) |

Generate VAPID keys with:
```bash
npx web-push generate-vapid-keys
```

### Application Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Yes | Base URL of the application |
| `NODE_ENV` | Yes | Environment: development, production, test |

### Map Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | No | Mapbox access token (if using Mapbox) |
| `NEXT_PUBLIC_DEFAULT_LAT` | No | Default map center latitude |
| `NEXT_PUBLIC_DEFAULT_LNG` | No | Default map center longitude |
| `NEXT_PUBLIC_DEFAULT_ZOOM` | No | Default map zoom level |

### Rate Limiting

| Variable | Required | Description |
|----------|----------|-------------|
| `RATE_LIMIT_WINDOW_SECONDS` | No | Seconds between allowed posts (default: 3600) |

### Media Processing

| Variable | Required | Description |
|----------|----------|-------------|
| `MAX_FILE_SIZE_BYTES` | No | Maximum upload file size (default: 500MB) |
| `MAX_MEDIA_PER_POST` | No | Maximum media items per post (default: 5) |
| `VIDEO_BITRATE` | No | FFmpeg video bitrate (default: 1000k) |
| `VIDEO_MAX_WIDTH` | No | Maximum video width (default: 1280) |
| `VIDEO_MAX_HEIGHT` | No | Maximum video height (default: 720) |
| `IMAGE_QUALITY` | No | JPEG quality 1-100 (default: 80) |
| `IMAGE_MAX_WIDTH` | No | Maximum image width (default: 1920) |
| `IMAGE_MAX_HEIGHT` | No | Maximum image height (default: 1080) |

### Post Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `POST_TTL_HOURS` | No | Hours before posts auto-delete (default: 168 = 7 days) |
