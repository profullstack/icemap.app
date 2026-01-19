# icemap.app - Development Todo

## ✅ Completed

- [x] Gather requirements and clarify project scope
- [x] Write architecture documentation in ./docs
- [x] Update README.md with project overview and setup instructions
- [x] Document environment variables in docs/ENV_VARIABLES.md

## Phase 1: Project Setup

- [ ] Create monorepo structure with pnpm workspaces
- [ ] Set up Next.js 16.1.1 app with TypeScript and Tailwind CSS
- [ ] Configure Vitest for testing
- [ ] Create Dockerfile with FFmpeg and ImageMagick for Railway deployment
- [ ] Create .env.example file from docs/ENV_VARIABLES.md template

## Phase 2: Database & Storage

- [ ] Set up Supabase schema - posts table with PostGIS for geolocation
- [ ] Set up Supabase schema - media table for post attachments
- [ ] Set up Supabase schema - comments table for post comments
- [ ] Set up Supabase schema - anonymous_users table for fingerprint to ID mapping
- [ ] Set up Supabase schema - votes table for upvotes/downvotes
- [ ] Set up Supabase schema - favorites table for saved posts
- [ ] Set up Supabase schema - reports table for flagged posts
- [ ] Set up Supabase schema - subscriptions table for area notifications
- [ ] Set up Supabase schema - rate_limits table for spam prevention
- [ ] Create Supabase storage bucket configuration
- [ ] Set up 8-hour auto-deletion cron job using pg_cron

## Phase 3: API Routes (Server-Side Only)

- [ ] Build fingerprint generation utility for anonymous user identification
- [ ] Build server-side API route for creating posts with rate limiting
- [ ] Build server-side API route for fetching posts by bounding box
- [ ] Build server-side API route for media upload with FFmpeg/ImageMagick processing
- [ ] Build server-side API route for area subscription management
- [ ] Build server-side API route for getting single post with media and comments
- [ ] Build server-side API route for adding comments to posts
- [ ] Build server-side API route for voting on posts
- [ ] Build server-side API route for favoriting posts
- [ ] Build server-side API route for getting user favorites
- [ ] Build server-side API route for reporting posts with email to admin
- [ ] Build server-side API route for getting current user anonymous ID

## Phase 4: Frontend Components

- [ ] Create map component with Leaflet and OpenStreetMap
- [ ] Implement marker clustering for map
- [ ] Create Find My Location button with geolocation API
- [ ] Build post creation form with incident type dropdown
- [ ] Build post detail page with media gallery and comments
- [ ] Build vote buttons component for upvote/downvote
- [ ] Build favorite button component
- [ ] Build report post button and modal
- [ ] Build comments section component with add comment form
- [ ] Build favorites page to display saved posts
- [ ] Create area subscription UI component

## Phase 5: PWA Features

- [ ] Implement PWA manifest with icons and theme
- [ ] Implement service worker for offline support
- [ ] Implement push notification subscription for area alerts

## Phase 6: Testing

- [ ] Write unit tests for API routes
- [ ] Write component tests for React components

---

## Architecture Summary

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full details.

### Tech Stack
- **Frontend**: Next.js 16.1.1, React, TypeScript, Tailwind CSS
- **Maps**: Leaflet + OpenStreetMap + react-leaflet
- **Backend**: Next.js API Routes (server-side only)
- **Database**: Supabase PostgreSQL with PostGIS
- **Storage**: Supabase Storage
- **Media Processing**: FFmpeg + ImageMagick (in Docker)
- **Testing**: Vitest
- **Deployment**: Railway with Docker

### Key Features
- 🗺️ Interactive map with marker clustering
- 📍 Find My Location geolocation
- 📸 Media upload with auto-conversion to JPEG/MP4
- 💬 Anonymous comments with random user IDs
- 👍 Upvote/downvote posts
- ⭐ Favorite posts with dedicated favorites page
- 🚩 Report posts (emails admin@icemap.app)
- 🔔 Push notifications for area alerts
- 🕐 Auto-expiring posts (8 hours)
- 🚫 No authentication - completely anonymous
- 📱 PWA - installable, works offline
- 🛡️ Rate limiting - 1 post per hour per user fingerprint

### Database Tables
1. **posts** - Incident reports with geolocation
2. **media** - Images/videos attached to posts
3. **comments** - User comments on posts
4. **anonymous_users** - Maps fingerprints to random IDs
5. **votes** - Upvotes/downvotes on posts
6. **favorites** - User saved posts
7. **reports** - Flagged posts for admin review
8. **subscriptions** - Area notification subscriptions
9. **rate_limits** - Spam prevention tracking

### API Endpoints
| Route | Method | Description |
|-------|--------|-------------|
| `/api/posts` | GET | Fetch posts within bounding box |
| `/api/posts` | POST | Create new post with rate limiting |
| `/api/posts/[id]` | GET | Get single post with media, comments, votes |
| `/api/posts/[id]/comments` | GET | Get comments for a post |
| `/api/posts/[id]/comments` | POST | Add comment to a post |
| `/api/posts/[id]/vote` | POST | Upvote or downvote a post |
| `/api/posts/[id]/favorite` | POST | Add post to favorites |
| `/api/posts/[id]/favorite` | DELETE | Remove post from favorites |
| `/api/posts/[id]/report` | POST | Report a post - sends email to admin |
| `/api/favorites` | GET | Get user favorites list |
| `/api/media/upload` | POST | Upload and process media |
| `/api/subscriptions` | POST | Subscribe to area notifications |
| `/api/subscriptions` | DELETE | Unsubscribe from notifications |
| `/api/me` | GET | Get current user anonymous ID |
