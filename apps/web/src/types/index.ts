export interface PostLink {
  url: string
  title?: string
}

export interface Post {
  id: string
  location: {
    lat: number
    lng: number
  }
  city?: string
  state?: string
  cross_street?: string
  summary: string
  incident_type: IncidentType
  fingerprint: string
  created_at: string
  expires_at: string
  vote_count?: number
  comment_count?: number
  media?: Media[]
  links?: PostLink[]
}

export type IncidentType =
  | 'ice_sighting'
  | 'traffic_accident'
  | 'road_hazard'
  | 'police_activity'
  | 'fire_emergency'
  | 'weather_event'
  | 'construction'
  | 'public_safety'
  | 'other'

export const INCIDENT_TYPES: { value: IncidentType; label: string; icon: string }[] = [
  { value: 'ice_sighting', label: 'ICE Sighting', icon: 'eye' },
  { value: 'traffic_accident', label: 'Traffic Accident', icon: 'car' },
  { value: 'road_hazard', label: 'Road Hazard', icon: 'warning' },
  { value: 'police_activity', label: 'Police Activity', icon: 'shield' },
  { value: 'fire_emergency', label: 'Fire/Emergency', icon: 'fire' },
  { value: 'weather_event', label: 'Weather Event', icon: 'cloud' },
  { value: 'construction', label: 'Construction', icon: 'cone' },
  { value: 'public_safety', label: 'Public Safety', icon: 'users' },
  { value: 'other', label: 'Other', icon: 'more' },
]

export interface Media {
  id: string
  post_id: string
  storage_path: string
  media_type: 'image' | 'video'
  original_filename?: string
  created_at: string
}

export interface Comment {
  id: string
  post_id: string
  fingerprint: string
  anonymous_id: string
  content: string
  created_at: string
}

export interface Vote {
  id: string
  post_id: string
  fingerprint: string
  vote_type: 1 | -1
  created_at: string
}

export interface Favorite {
  id: string
  post_id: string
  fingerprint: string
  created_at: string
  post?: Post
}

export interface Report {
  id: string
  post_id: string
  fingerprint: string
  reason: string
  status: 'pending' | 'reviewed' | 'dismissed'
  created_at: string
}

export interface Subscription {
  id: string
  fingerprint: string
  bounding_box: {
    sw: { lat: number; lng: number }
    ne: { lat: number; lng: number }
  }
  push_endpoint?: string
  push_p256dh?: string
  push_auth?: string
  created_at: string
}

export interface AnonymousUser {
  fingerprint: string
  anonymous_id: string
  created_at: string
}

export interface BoundingBox {
  north: number
  south: number
  east: number
  west: number
}
