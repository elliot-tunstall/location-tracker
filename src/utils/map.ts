import type { Coord } from "../types/location";

export function getMapRegion(route: Coord[]) {
  // Calculate bounds
  const latitudes = route.map(coord => coord.latitude);
  const longitudes = route.map(coord => coord.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  // Calculate center and deltas
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;
  const latitudeDelta = maxLat - minLat + 0.01; // Add some padding
  const longitudeDelta = maxLng - minLng + 0.01; // Add some padding

  const region = {
    latitude: centerLat,
    longitude: centerLng,
    latitudeDelta,
    longitudeDelta
  }

  return region
}