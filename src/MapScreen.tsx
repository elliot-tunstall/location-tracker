import React, { useEffect, useRef, useState } from 'react';
import { Button, View, Alert, Platform, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service'
import { check, request, RESULTS, PERMISSIONS } from 'react-native-permissions';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import haversine from 'haversine-distance'
import { format } from 'path';

// PERSMISSIONS
const ANDROID_PERMISSION = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
const IOS_PERMISSION = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

interface Coord{
  latitude: number
  longitude: number
}

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (coord1: Coord, coord2: Coord): number => {
  const distanceMeters = haversine(coord1, coord2)

  return distanceMeters
};

// Format time as H:MM:SS
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60); // Ensure seconds are whole numbers
  
  // Ensure minutes doesn't exceed 2 digits (99:59 max)
  const displayMins = Math.min(mins, 99);
  const displaySecs = Math.min(secs, 59);
  
  return `${displayMins.toString().padStart(2, '0')}:${displaySecs.toString().padStart(2, '0')}`;
};

const MapScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [route, setRoute] = useState<Coord[]>([]);
  const [distance, setDistance] = useState<number>(0); // in miles
  const [pace, setPace] = useState<string>('--:--'); // minutes per mile
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const watchId = useRef(0);
  const timeInterval = useRef<NodeJS.Timeout | null>(null);

  const requestPermissions = async () => {
    const permission = (Platform.OS === 'android') ? ANDROID_PERMISSION : IOS_PERMISSION;

    let status = await check(permission);
    if (status !== RESULTS.GRANTED) {
      status = await request(permission);
    }
    if (status !== RESULTS.GRANTED) {
      Alert.alert(
        'Permission needed',
        'We need access to your location to track your activity.',
      );
    }

    return status === RESULTS.GRANTED;
  };

  useEffect(() => {
    // request permissions
    const checkPermissions = async () => {
      const hasPermission = await requestPermissions();
      // if no permission, return
      if (!hasPermission) {
        console.warn("Permissions not granted")
        return;
      }
    };
    
    checkPermissions();
  }, [])

  // Cumulatively Calculate total distance
  useEffect(() => {
    if (route.length < 2) {
      setDistance(0);
      return;
    }

    // Only calculate the new segment distance and add to existing total
    const lastIndex = route.length - 1;
    const prev = route[lastIndex - 1];
    const curr = route[lastIndex];
    const newSegmentDistance = calculateDistance(prev, curr);
    
    setDistance(prevDistance => prevDistance + newSegmentDistance);
  }, [route]);

  // Calculate pace based on distance and elapsed time
  useEffect(() => {
    if (distance > 0 && elapsedTime > 0) {

      //pace calculations
      const elapsedTimeSeconds = elapsedTime / 1000 // ms -> s
      const distanceInMiles = distance / 1609.34; // Convert meters to miles
      const paceSeconds = elapsedTimeSeconds / distanceInMiles; // seconds per mile

      setPace(formatTime(paceSeconds));
    } 
    else {
      setPace('--:--');
    }
  }, [distance, elapsedTime]);

  // Update elapsed time when tracking
  useEffect(() => {
    if (isTracking && startTime) {
      timeInterval.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    } else {
      if (timeInterval.current) {
        clearInterval(timeInterval.current);
        timeInterval.current = null;
      }
    }

    return () => {
      if (timeInterval.current) {
        clearInterval(timeInterval.current);
      }
    };
  }, [isTracking, startTime]);

  const startTracking = async () => {
    // check permissions
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    // Reset tracking state
    setRoute([]);
    setDistance(0);
    setPace('--:--');
    setElapsedTime(0);
    setStartTime(Date.now());
    setIsTracking(true);

    watchId.current = Geolocation.watchPosition(
      (position) => {
        // success callback
        const { latitude, longitude } = position.coords;
        setRoute((prev) => [...prev, { latitude, longitude }]);
      },
      // error callback
      (error) => {
        console.warn(error);
      },
      // watchposition options
      {
        enableHighAccuracy: true,
        distanceFilter: 5,
        interval: 5000,
        fastestInterval: 2000,
        forceRequestLocation: true,
        useSignificantChanges: false,
      }
    );
  };

  const stopTracking = () => {
    if (watchId.current) {
      Geolocation.clearWatch(watchId.current);
      watchId.current = 0;
    }
    setIsTracking(false);
    setStartTime(null);
  };

  const saveWorkout = () => {
    // TODO: Implement save workout functionality
    // Navigate to the workout complete screen to show the summary
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      {/* Stats Display */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Distance</Text>
          <Text style={styles.statValue}>{(distance/1609.36).toFixed(2)} mi</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Pace</Text>
          <Text style={styles.statValue}>{pace} /mi</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Time</Text>
          <Text style={styles.statValue}>{formatTime(Math.floor(elapsedTime / 1000))}</Text>
        </View>
      </View>

      <MapView
        style={{
          flex: 1,
        }}
        showsUserLocation
        followsUserLocation
      >
        <>
          {route.length > 0 && <Marker coordinate={route[0]} title="Start" />}
          <Polyline coordinates={route} strokeWidth={5} strokeColor="#007AFF" />
        </>
      </MapView>

      <View style={styles.buttonContainer}>
        {!isTracking ? (
          <Button title="Start Tracking" onPress={startTracking} />
        ) : (
          <View style={styles.buttonRow}>
            <Button title="Stop Tracking" onPress={stopTracking} color="#FF3B30" />
            <Button title="Save Workout" onPress={saveWorkout} color="#34C759" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginTop: 4,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default MapScreen;
