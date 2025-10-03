// Utilities to extract geolocation from various item shapes

export function extractLocation(item) {
  if (!item || typeof item !== 'object') return null;

  const asNumber = (v) => {
    const n = typeof v === 'string' ? parseFloat(v) : v;
    return Number.isFinite(n) ? n : null;
  };

  // Common direct fields
  let lat = asNumber(item.latitude ?? item.lat);
  let lng = asNumber(item.longitude ?? item.lng ?? item.lon);

  // Nested location object
  if ((lat == null || lng == null) && item.location && typeof item.location === 'object') {
    lat = asNumber(item.location.latitude ?? item.location.lat);
    lng = asNumber(item.location.longitude ?? item.location.lng ?? item.location.lon);
  }

  // Fallback: region/city name for label
  const label =
    item.region?.name ||
    item.city?.name ||
    item.location?.name ||
    item.region ||
    item.city ||
    item.place ||
    item.title ||
    item.name ||
    null;

  if (lat != null && lng != null) {
    return { lat, lng, label };
  }

  // If only label present, return that to feed the map's search
  if (label) {
    return { lat: null, lng: null, label };
  }

  return null;
}

// Extract a best-effort datetime value from heterogeneous objects
export function extractDateTime(item) {
  if (!item || typeof item !== 'object') return null;

  const fields = [
    'published_at', 'published_date', 'date', 'datetime', 'timestamp',
    'created_at', 'created', 'updated_at', 'time'
  ];
  for (const key of fields) {
    const v = item[key];
    if (v) return v;
  }
  // Try nested meta object if present
  if (item.meta && typeof item.meta === 'object') {
    for (const key of fields) {
      const v = item.meta[key];
      if (v) return v;
    }
  }
  return null;
}

export function formatDateTime(value) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return String(value);
  try {
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return d.toLocaleString();
  }
}
export default { extractLocation, extractDateTime, formatDateTime };
