
// Coord should be use for all geographic locations
export interface Coord {
  latitude: number
  longitude: number
}

export interface MapRegion {
  latitude: number
  longitude: number
  latitudeDelta: number
  longitudeDelta: number
}
