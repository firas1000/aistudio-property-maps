/**
 * Parses user input into latitude and longitude coordinates.
 * Handles:
 * - Direct decimal format: "37.7749, -122.4194" or "37.7749 -122.4194"
 * - Directional format: "37.7749° N, 122.4194° W" or "37°46'29.6\"N 122°25'09.8\"W"
 * - Google Maps URLs:
 *   - https://www.google.com/maps/@37.774929,-122.4194155,17z
 *   - https://www.google.com/maps/place/.../@37.774929,-122.4194155,17z
 *   - https://maps.google.com/?q=37.7749,-122.4194
 *   - https://www.google.com/maps/search/?api=1&query=37.7749,-122.4194
 */

export interface ParsedCoordinates {
  latitude: number;
  longitude: number;
  isValid: boolean;
  errorMessage?: string;
}

export function parseCoordinates(input: string): ParsedCoordinates {
  const trimmed = input.trim();
  if (!trimmed) {
    return { latitude: 0, longitude: 0, isValid: false, errorMessage: 'Empty coordinates input' };
  }

  // 1. Check for Google Maps URL with @lat,lng
  const atMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (isValidLatLng(lat, lng)) {
      return { latitude: lat, longitude: lng, isValid: true };
    }
  }

  // 2. Check for Google Maps URL with q=lat,lng or query=lat,lng or ll=lat,lng
  const queryMatch = trimmed.match(/[?&](?:q|query|ll|loc|center)=(-?\d+\.\d+)(?:,|%2C|\+)(-?\d+\.\d+)/i);
  if (queryMatch) {
    const lat = parseFloat(queryMatch[1]);
    const lng = parseFloat(queryMatch[2]);
    if (isValidLatLng(lat, lng)) {
      return { latitude: lat, longitude: lng, isValid: true };
    }
  }

  // 3. Check for DMS with N/S and E/W: e.g., 37°46'29.6"N 122°25'09.8"W or 37.7749 N, 122.4194 W
  const dmsMatch = trimmed.match(
    /(\d+(?:\.\d+)?)[°\s]+(?:(\d+(?:\.\d+)?)[′'\s]+)?(?:(\d+(?:\.\d+)?)[″"\s]*)?([NS])\s*[,/]?\s*(\d+(?:\.\d+)?)[°\s]+(?:(\d+(?:\.\d+)?)[′'\s]+)?(?:(\d+(?:\.\d+)?)[″"\s]*)?([EW])/i
  );
  if (dmsMatch) {
    let lat = parseFloat(dmsMatch[1]) + (parseFloat(dmsMatch[2] || '0') / 60) + (parseFloat(dmsMatch[3] || '0') / 3600);
    if (dmsMatch[4].toUpperCase() === 'S') lat = -lat;

    let lng = parseFloat(dmsMatch[5]) + (parseFloat(dmsMatch[6] || '0') / 60) + (parseFloat(dmsMatch[7] || '0') / 3600);
    if (dmsMatch[8].toUpperCase() === 'W') lng = -lng;

    if (isValidLatLng(lat, lng)) {
      return { latitude: lat, longitude: lng, isValid: true };
    }
  }

  // 4. Standard comma or space separated numbers: "37.7749, -122.4194"
  // Clean up any extra text like "lat:", "latitude:", etc.
  const cleaned = trimmed
    .replace(/(?:latitude|lat|longitude|lng|long)[:\s=]*/gi, ' ')
    .replace(/[()]/g, ' ')
    .trim();

  const numbers = cleaned.split(/[\s,;|]+/).map((s) => parseFloat(s)).filter((n) => !isNaN(n));
  if (numbers.length >= 2) {
    const lat = numbers[0];
    const lng = numbers[1];
    if (isValidLatLng(lat, lng)) {
      return { latitude: lat, longitude: lng, isValid: true };
    }
  }

  return {
    latitude: 0,
    longitude: 0,
    isValid: false,
    errorMessage: 'Could not extract valid latitude (-90 to 90) and longitude (-180 to 180)',
  };
}

export function isValidLatLng(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export function formatDMS(lat: number, lng: number): { latDMS: string; lngDMS: string } {
  const formatComponent = (deg: number, isLat: boolean) => {
    const absDeg = Math.abs(deg);
    const d = Math.floor(absDeg);
    const minFloat = (absDeg - d) * 60;
    const m = Math.floor(minFloat);
    const s = ((minFloat - m) * 60).toFixed(1);
    const dir = isLat ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W');
    return `${d}°${m}'${s}"${dir}`;
  };

  return {
    latDMS: formatComponent(lat, true),
    lngDMS: formatComponent(lng, false),
  };
}

/**
 * Builds the Google Maps Static API URL.
 */
export function buildStaticMapUrl(options: {
  latitude: number;
  longitude: number;
  zoom?: number;
  width?: number;
  height?: number;
  scale?: number;
  mapType?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  markerColor?: string;
  markerLabel?: string;
  apiKey?: string;
}): string {
  const {
    latitude,
    longitude,
    zoom = 15,
    width = 360,
    height = 240,
    scale = 2,
    mapType = 'roadmap',
    markerColor = 'red',
    markerLabel = 'P',
    apiKey = '',
  } = options;

  const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';
  const params = new URLSearchParams();

  params.set('center', `${latitude},${longitude}`);
  params.set('zoom', zoom.toString());
  params.set('size', `${width}x${height}`);
  params.set('scale', scale.toString());
  params.set('maptype', mapType);

  // Markers format: markers=color:red|label:P|lat,lng
  const labelParam = markerLabel ? `label:${markerLabel.charAt(0).toUpperCase()}|` : '';
  params.set('markers', `color:${markerColor}|${labelParam}${latitude},${longitude}`);

  if (apiKey) {
    params.set('key', apiKey);
  }

  return `${baseUrl}?${params.toString()}`;
}

export function buildGoogleMapsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}
