# icemap.app

An anonymous, location-based incident reporting PWA. Users can report incidents on a map with photos and videos. All posts auto-delete after 8 hours to prevent stale or false information.

## Features

- 🗺️ **Interactive Map** - View incidents on a Leaflet/OpenStreetMap map with marker clustering
- 📍 **Find My Location** - One-click geolocation to center the map on your position
- 📸 **Media Upload** - Upload photos and videos (auto-converted to JPEG/MP4)
- 🔔 **Area Notifications** - Subscribe to push notifications for new incidents in your area
- 🕐 **Auto-Expiring Posts** - All posts deleted after 8 hours
- 🚫 **No Authentication** - Completely anonymous, no accounts required
- 📱 **PWA** - Installable on mobile devices, works offline

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16.1.1, React, TypeScript |
| Styling | Tailwind CSS |
| Maps | Leaflet + OpenStreetMap + react-leaflet |
| Backend | Next.js API Routes (server-side only) |
| Database | Supabase PostgreSQL with PostGIS |
| Storage | Supabase Storage |
| Media Processing | FFmpeg + ImageMagick |
| Testing | Vitest |
| Deployment | Railway with Docker |

## Project Structure

```
icemap.app/
├── apps/
│   └── web/                    # Next.js PWA application
│       ├── src/
│       │   ├── app/            # Next.js App Router
│       │   │   ├── api/        # Server-side API routes
│       │   │   ├── post/[id]/  # Post detail page
│       │   │   └── page.tsx    # Map home page
│       │   ├── components/     # React components
│       │   ├── lib/            # Utilities and Supabase client
│       │   └── types/          # TypeScript types
│       ├── public/             # Static assets + PWA manifest
│       └── Dockerfile          # Docker with FFmpeg/ImageMagick
├── packages/
│   └── supabase/               # Supabase migrations and types
│       ├── migrations/         # SQL migrations
│       └── seed.sql            # Seed data for incident types
├── docs/                       # Documentation
├── todo.md                     # Development progress tracker
├── pnpm-workspace.yaml         # Monorepo workspace config
├── .env.example                # Environment variables template
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker (for local development with FFmpeg/ImageMagick)
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/icemap.app.git
   cd icemap.app
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Set up Supabase:
   - Create a new Supabase project
   - Enable PostGIS extension
   - Run migrations from `packages/supabase/migrations/`
   - Create storage bucket for media

5. Start development server:
   ```bash
   pnpm dev
   ```

### Environment Variables

See `.env.example` for all required environment variables.

## API Routes

All API routes are server-side only. Supabase is NEVER called from the client.

| Route | Method | Description |
|-------|--------|-------------|
| `/api/posts` | GET | Fetch posts within bounding box |
| `/api/posts` | POST | Create new post with rate limiting |
| `/api/posts/[id]` | GET | Get single post with media |
| `/api/media/upload` | POST | Upload and process media |
| `/api/subscriptions` | POST | Subscribe to area notifications |
| `/api/subscriptions` | DELETE | Unsubscribe from notifications |

## Deployment

### Railway

This project is configured for Railway deployment using Docker:

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Railway will automatically build and deploy using the Dockerfile

The Dockerfile includes FFmpeg and ImageMagick for server-side media processing.

## Rate Limiting

To prevent spam, users are limited to 1 post per hour. Rate limiting is based on a fingerprint generated from:
- IP address
- User-Agent
- Accept-Language header

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design and technical details
- [Todo](todo.md) - Development progress tracker

## License

MIT
