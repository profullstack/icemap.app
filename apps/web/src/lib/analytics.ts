declare global {
  interface Window {
    datafast?: (event: string, data?: Record<string, unknown>) => void
  }
}

export function track(event: string, data?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.datafast) {
    window.datafast(event, data)
  }
}

// Pre-defined events for consistency
export const events = {
  // Map interactions
  MAP_LOCATE: 'map_locate',
  MAP_CLICK: 'map_click',
  MAP_ZOOM: 'map_zoom',
  MAP_FILTER: 'map_filter',
  MAP_SEARCH: 'map_search',

  // Post interactions
  POST_VIEW: 'post_view',
  POST_CREATE_START: 'post_create_start',
  POST_CREATE_SUBMIT: 'post_create_submit',
  POST_CREATE_SUCCESS: 'post_create_success',
  POST_CREATE_ERROR: 'post_create_error',

  // Voting
  VOTE_UP: 'vote_up',
  VOTE_DOWN: 'vote_down',
  VOTE_REMOVE: 'vote_remove',

  // Favorites
  FAVORITE_ADD: 'favorite_add',
  FAVORITE_REMOVE: 'favorite_remove',
  FAVORITES_VIEW: 'favorites_view',

  // Comments
  COMMENT_SUBMIT: 'comment_submit',
  COMMENT_SUCCESS: 'comment_success',

  // Reports
  REPORT_OPEN: 'report_open',
  REPORT_SUBMIT: 'report_submit',
  REPORT_SUCCESS: 'report_success',

  // Sharing
  SHARE_CLICK: 'share_click',
  SHARE_SUCCESS: 'share_success',

  // Media
  MEDIA_UPLOAD_START: 'media_upload_start',
  MEDIA_UPLOAD_SUCCESS: 'media_upload_success',
  MEDIA_UPLOAD_ERROR: 'media_upload_error',
  MEDIA_GALLERY_OPEN: 'media_gallery_open',

  // Navigation
  NAV_FAVORITES: 'nav_favorites',
  NAV_BACK_TO_MAP: 'nav_back_to_map',
}
