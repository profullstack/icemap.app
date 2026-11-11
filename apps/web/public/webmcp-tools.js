// icemap's own WebMCP tools, beside the @profullstack/webmcp embed in the root
// layout (site_info, open_page). Read-only: they call the same public JSON
// routes the map uses. Reporting stays a person pressing the button.

const getJson = async (path) => {
  const res = await fetch(path, { credentials: 'same-origin' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
};

const tools = [
  {
    name: 'recent_incidents',
    description: 'The most recent anonymous incident reports on icemap (newest first).',
    inputSchema: {
      type: 'object',
      properties: { limit: { type: 'integer', minimum: 1, maximum: 100 } },
    },
    annotations: { readOnlyHint: true },
    execute: ({ limit = 20 }) => getJson(`/api/posts/recent?limit=${encodeURIComponent(limit)}`),
  },
  {
    name: 'incidents_near',
    description: 'Incident reports within a radius (miles) of a latitude/longitude.',
    inputSchema: {
      type: 'object',
      properties: {
        lat: { type: 'number', description: 'Latitude' },
        lng: { type: 'number', description: 'Longitude' },
        radius: { type: 'number', description: 'Radius in miles (default 100)' },
        limit: { type: 'integer', minimum: 1, maximum: 50 },
      },
      required: ['lat', 'lng'],
    },
    annotations: { readOnlyHint: true },
    execute: ({ lat, lng, radius = 100, limit = 10 }) => {
      const qs = new URLSearchParams({ lat: String(lat), lng: String(lng), radius: String(radius), limit: String(limit) });
      return getJson(`/api/posts/nearby?${qs}`);
    },
  },
  {
    name: 'incidents_in_area',
    description: 'Incident reports inside a map bounding box (north/south latitudes, east/west longitudes).',
    inputSchema: {
      type: 'object',
      properties: {
        north: { type: 'number' },
        south: { type: 'number' },
        east: { type: 'number' },
        west: { type: 'number' },
      },
      required: ['north', 'south', 'east', 'west'],
    },
    annotations: { readOnlyHint: true },
    execute: ({ north, south, east, west }) => {
      const qs = new URLSearchParams({ north: String(north), south: String(south), east: String(east), west: String(west) });
      return getJson(`/api/posts?${qs}`);
    },
  },
];

function register() {
  const api = globalThis.ProfullstackWebMCP;
  if (api?.supported) api.registerTools(tools);
}

if (globalThis.ProfullstackWebMCP?.unregisterAll) register();
else document.addEventListener('webmcp:ready', register, { once: true });
