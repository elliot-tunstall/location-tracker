import React, { useEffect, useRef, useState } from 'react';
import { Button, View, Alert, Platform, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service'
import { check, request, RESULTS, PERMISSIONS } from 'react-native-permissions';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatTime, calculateDistance } from './utils/metrics';
import { StatsContainer, StatCard } from './components/DisplayStats';

import type { Coord, MapRegion } from './types/location';

// PERSMISSIONS
const ANDROID_PERMISSION = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
const IOS_PERMISSION = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;


const MapScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [route, setRoute] = useState<Coord[]>([]);
  const [mapRegion, setMapRegion] = useState<MapRegion>()
  const [distance, setDistance] = useState<number>(0); // in miles
  const [pace, setPace] = useState<string>('--:--'); // minutes per mile
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const watchId = useRef(0);
  const timeInterval = useRef<NodeJS.Timeout | null>(null);
  const splitTimesRef = useRef<number[]>([]);

  const requestPermissions = async () => {
    const permission = (Platform.OS === 'android') ? ANDROID_PERMISSION : IOS_PERMISSION;

    let status = await check(permission);
    if (status !== RESULTS.GRANTED) {
      status = await request(permission);
    }
    console.log(status)
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
    if (!isTracking)return;

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

    // calculate 100m spilt times
    if ((distance / 100) >= splitTimesRef.current.length + 1) {
      const lastElapsed = splitTimesRef.current.reduce((sum, t) => sum + t, 0); // sum of all previous splits
      const newSplitTime = (elapsedTime / 1000) - lastElapsed; // seconds
      if (newSplitTime > 0) {
        splitTimesRef.current.push(newSplitTime);
      }
    }
    
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

  // set an interval to update elapsed time every second while tracking
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
    // Reset tracking state
    setRoute([])
    setDistance(0)
    setPace('--:--');
    setElapsedTime(0);
    setStartTime(Date.now());
    setIsTracking(true);
    
    // check permissions
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    // setup location watcher
    watchId.current = Geolocation.watchPosition(
      (position) => {
        // success callback
        const { latitude, longitude } = position.coords;
        setRoute((prev) => [...prev, { latitude, longitude }]);
        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
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
      Geolocation.clearWatch(watchId.current); // cleanup loaction watcher
      watchId.current = 0;
    }

    setIsTracking(false);
    setStartTime(null);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Stats Display */}
      <StatsContainer>
        <StatCard label="Distance" value={`${(distance / 1609.36).toFixed(2)} mi`} />
        <StatCard label="Pace" value={`${pace} /mi`} />
        <StatCard label="Time" value={formatTime(Math.floor(elapsedTime / 1000))} />
      </StatsContainer>

      <MapView
        style={{
          flex: 1,
        }}
        showsUserLocation
        followsUserLocation
        region={mapRegion}
        onRegionChangeComplete={setMapRegion}
      >
        <>
          {route.length > 0 && <Marker coordinate={route[0]} title="Start" />}
          <Polyline coordinates={route} strokeWidth={5} strokeColor="#007AFF" />
          {(route.length > 0 && !isTracking) && <Marker coordinate={route[route.length - 1]} title="finish" />}
        </>
      </MapView>

      <View style={styles.buttonContainer}>
        {!isTracking ? (
          <Button title="Start Tracking" onPress={startTracking} />
        ) : (
          <View style={styles.buttonRow}>
            <Button title="Stop Tracking" onPress={stopTracking} color="#FF3B30" />
            <Button title="Save Workout" onPress={() => {
              stopTracking(); 
              navigation.navigate('WorkoutComplete', {
                // pass metrics through to summary
                distance,
                pace,
                elapsedTime,
                route,
                splitTimes: splitTimesRef.current
              });
            }}
             color="#34C759" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
