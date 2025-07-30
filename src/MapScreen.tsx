import React, { useEffect } from 'react';
import { Button, View, Alert, Platform } from 'react-native';
import MapView from 'react-native-maps';
import { check, request, RESULTS, PERMISSIONS } from 'react-native-permissions';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

// PERSMISSIONS
const ANDROID_PERMISSION = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
const IOS_PERMISSION = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

const MapScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const requestPermissions = async () => {
    const permission = (Platform.OS === 'android') ? ANDROID_PERMISSION : IOS_PERMISSION;

    let status = await check(permission);
    if (status !== RESULTS.GRANTED) {
      status = await request(permission);
    }

    console.log(status);
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

  const startTracking = async () => {
    // TODO: Implement tracking functionality
    if (!await requestPermissions()) {
      return;
    }
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
      <MapView
        style={{
          flex: 1,
        }}
        showsUserLocation
        followsUserLocation
      />

      <Button title="Start Tracking" onPress={startTracking} />
    </SafeAreaView>
  );
};

export default MapScreen;
