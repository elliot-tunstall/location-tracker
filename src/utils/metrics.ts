import haversine from 'haversine-distance'
import caloriesBurnt from 'calories-burnt';

import type { Coord } from '../types/location'

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (coord1: Coord, coord2: Coord): number => {
  const distanceMeters = haversine(coord1, coord2)

  return distanceMeters
};

// Format time as H:MM:SS or MM:SS
export const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  // Ensure minutes and seconds are always 2 digits
  const displayMins = mins.toString().padStart(2, '0');
  const displaySecs = secs.toString().padStart(2, '0');

  // only displays hours if necessary 
  if (hrs > 0) {
    return `${hrs}:${displayMins}:${displaySecs}`;
  } else {
    return `${displayMins}:${displaySecs}`;
  }
};

export const estimateCalories = (distanceMeters: number) => {
  const calories = caloriesBurnt({
    meters: distanceMeters,
    slope: -0.015,
    treadmill: false,
    age: 23,
    restingHeartBeatsPerMinute: 80,
    kilograms: 80
});

return calories
}