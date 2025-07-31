import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import { useRoute } from '@react-navigation/native';
import { estimateCalories, formatTime } from './utils/metrics';
import { StatsContainer, StatCard } from './components/DisplayStats';

import type { Coord } from './types/location';
import { getMapRegion } from './utils/map';

const WorkoutComplete = () => {
  const routeObj = useRoute();
  const { distance, pace, elapsedTime, route } = routeObj.params as {
    distance: number;
    pace: string;
    elapsedTime: number;
    route: Coord[];
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{backgroundColor: 'white'}}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fd5c63', margin: 20 }}>
          Congratulations, Workout Complete!
        </Text>
      </View>
      <MapView
        style={{
          flex: 1,
        }}
        showsUserLocation
        region={getMapRegion(route)}
      >
        <>
          {<Marker coordinate={route[0]} title="Start" />}
          <Polyline coordinates={route} strokeWidth={5} strokeColor="#007AFF" />
          {<Marker coordinate={route[route.length - 1]} title="finish" />}
        </>
      </MapView>
        <StatsContainer>
          <StatCard label="Distance" value={`${(distance / 1609.36).toFixed(2)} mi`} />
          <StatCard label="Pace" value={`${pace} /mi`} />
          <StatCard label="Time" value={formatTime(Math.floor(elapsedTime / 1000))} />
        </StatsContainer>
        <StatsContainer>
          <StatCard label="Calories Burnt" value={`${estimateCalories(distance)} kCal`} />
          <StatCard label="Average Heart Rate" value={`146 bpm`} />
        </StatsContainer>
    </SafeAreaView>
  );
};

export default WorkoutComplete;
