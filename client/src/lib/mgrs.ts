const MGRS_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const MGRS_SET_ORIGIN_COLUMN_LETTERS = "AJSAJS";
const MGRS_SET_ORIGIN_ROW_LETTERS = "AFAFAF";

function getLetterDesignator(lat: number): string {
  if (lat >= 84 || lat < -80) return "Z";
  const letters = "CDEFGHJKLMNPQRSTUVWX";
  const idx = Math.floor((lat + 80) / 8);
  return letters[Math.min(idx, letters.length - 1)];
}

function getZoneNumber(lat: number, lng: number): number {
  if (lat >= 56 && lat < 64 && lng >= 3 && lng < 12) return 32;
  if (lat >= 72 && lat < 84) {
    if (lng >= 0 && lng < 9) return 31;
    if (lng >= 9 && lng < 21) return 33;
    if (lng >= 21 && lng < 33) return 35;
    if (lng >= 33 && lng < 42) return 37;
  }
  return Math.floor((lng + 180) / 6) + 1;
}

function degToRad(deg: number): number {
  return deg * Math.PI / 180;
}

function latLngToUtm(lat: number, lng: number): { easting: number; northing: number; zone: number } {
  const zone = getZoneNumber(lat, lng);
  const latRad = degToRad(lat);
  const lngRad = degToRad(lng);
  
  const a = 6378137;
  const f = 1 / 298.257223563;
  const k0 = 0.9996;
  
  const e = Math.sqrt(2 * f - f * f);
  const e2 = e * e / (1 - e * e);
  
  const lngOrigin = (zone - 1) * 6 - 180 + 3;
  const lngOriginRad = degToRad(lngOrigin);
  
  const N = a / Math.sqrt(1 - e * e * Math.sin(latRad) * Math.sin(latRad));
  const T = Math.tan(latRad) * Math.tan(latRad);
  const C = e2 * Math.cos(latRad) * Math.cos(latRad);
  const A = Math.cos(latRad) * (lngRad - lngOriginRad);
  
  const M = a * (
    (1 - e * e / 4 - 3 * e * e * e * e / 64 - 5 * Math.pow(e, 6) / 256) * latRad -
    (3 * e * e / 8 + 3 * e * e * e * e / 32 + 45 * Math.pow(e, 6) / 1024) * Math.sin(2 * latRad) +
    (15 * e * e * e * e / 256 + 45 * Math.pow(e, 6) / 1024) * Math.sin(4 * latRad) -
    (35 * Math.pow(e, 6) / 3072) * Math.sin(6 * latRad)
  );
  
  const easting = k0 * N * (
    A + (1 - T + C) * A * A * A / 6 +
    (5 - 18 * T + T * T + 72 * C - 58 * e2) * Math.pow(A, 5) / 120
  ) + 500000;
  
  let northing = k0 * (
    M + N * Math.tan(latRad) * (
      A * A / 2 + (5 - T + 9 * C + 4 * C * C) * Math.pow(A, 4) / 24 +
      (61 - 58 * T + T * T + 600 * C - 330 * e2) * Math.pow(A, 6) / 720
    )
  );
  
  if (lat < 0) northing += 10000000;
  
  return { easting, northing, zone };
}

function get100kId(easting: number, northing: number, zone: number): string {
  const setNumber = zone % 6;
  const colOrigin = MGRS_SET_ORIGIN_COLUMN_LETTERS.charCodeAt(setNumber) - 65;
  const rowOrigin = MGRS_SET_ORIGIN_ROW_LETTERS.charCodeAt(setNumber) - 65;
  
  const col100k = Math.floor(easting / 100000);
  const row100k = Math.floor(northing / 100000) % 20;
  
  const colLetter = MGRS_LETTERS[(colOrigin + col100k - 1) % 24];
  const rowLetter = MGRS_LETTERS[(rowOrigin + row100k) % 20];
  
  return colLetter + rowLetter;
}

export function latLngToMgrs(lat: number, lng: number, precision: number = 5): string {
  if (lat < -80 || lat > 84) {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
  
  const zone = getZoneNumber(lat, lng);
  const band = getLetterDesignator(lat);
  const { easting, northing } = latLngToUtm(lat, lng);
  const id100k = get100kId(easting, northing, zone);
  
  const e = Math.floor(easting % 100000);
  const n = Math.floor(northing % 100000);
  
  const divisor = Math.pow(10, 5 - precision);
  const eStr = String(Math.floor(e / divisor)).padStart(precision, "0");
  const nStr = String(Math.floor(n / divisor)).padStart(precision, "0");
  
  return `${zone}${band} ${id100k} ${eStr} ${nStr}`;
}

export function formatMgrsShort(lat: number, lng: number): string {
  return latLngToMgrs(lat, lng, 4);
}
