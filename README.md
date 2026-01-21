# 🗺️ icemap.app

> Anonymous, real-time incident reporting on a map. No accounts. No tracking. Posts auto-delete after 7 days.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![Deploy on Railway](https://img.shields.io/badge/Deploy-Railway-purple)](https://railway.app/)

## What is icemap?

icemap is a privacy-first PWA for reporting local incidents. See something happening? Drop a pin, add photos/videos, and let your community know. All posts automatically expire after 7 days to prevent stale information.

**No sign-up required. Completely anonymous.**

## ✨ Features

- 🗺️ **Interactive Map** - View incidents on OpenStreetMap with marker clustering
- 📍 **Find My Location** - One-tap geolocation
- 📸 **Media Upload** - Photos and videos auto-converted to web-optimized formats
- 💬 **Anonymous Comments** - Discuss incidents with random user IDs
- 👍 **Voting** - Upvote/downvote to surface important reports
- ⭐ **Favorites** - Save posts for quick access
- 🚩 **Report** - Flag inappropriate content
- 🔔 **Area Alerts** - Get notified about new incidents nearby
- 🕐 **Auto-Expiring** - All posts deleted after 7 days
- 📱 **PWA** - Install on any device, works offline

## 🛠️ Tech Stack

- **Frontend**: Next.js 16.1.1, React, TypeScript, Tailwind CSS
- **Maps**: Leaflet + OpenStreetMap
- **Backend**: Next.js API Routes (server-side only)
- **Database**: Supabase PostgreSQL with PostGIS
- **Storage**: Supabase Storage
- **Media Processing**: FFmpeg + ImageMagick
- **Deployment**: Railway (Docker)

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/yourusername/icemap.app.git
cd icemap.app

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Start development server
pnpm dev
```

## 📖 Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design and technical details
- [Environment Variables](docs/ENV_VARIABLES.md) - Configuration reference
- [Development Todo](todo.md) - Project progress tracker

## 🔒 Privacy

- **No accounts** - No email, no password, no tracking
- **Anonymous IDs** - Random identifiers like `anon_x7k2m9`
- **Auto-deletion** - Posts expire after 7 days
- **Server-side only** - All database calls happen on the server

## 📄 License

MIT © icemap.app
