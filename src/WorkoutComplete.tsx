import React from 'react';
import { Alert, Dimensions, SafeAreaView, Text, View } from 'react-native';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import { useRoute } from '@react-navigation/native';
import { estimateCalories, formatTime } from './utils/metrics';
import { StatsContainer, StatCard } from './components/DisplayStats';
import { BarChart } from 'react-native-gifted-charts'; // Re-import BarChart

import type { Coord } from './types/location';
import { getMapRegion } from './utils/map';

const WorkoutComplete = () => {
  const routeObj = useRoute();
  const { distance, pace, elapsedTime, route, splitTimes } = routeObj.params as {
    distance: number;
    pace: string;
    elapsedTime: number;
    route: Coord[];
    splitTimes: number[]
  };

  // Prepare data for the bar chart
  const data = splitTimes.map((value, index) => ({ value, label: `${(index + 1)}` })); // Keep it simple for BarChart

  Alert.alert("Workout Saved to Activity")

  return (
    <SafeAreaView style={{ flex: 1 }}>
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

      {(splitTimes.length > 0) && (
        <View style={{ height: 300, padding: 20 }}>
      {/* Y-axis title */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Chart */}
        <View>
          {/* Top space for alignment */}
          <Text style={{ textAlign: 'center', marginBottom: 10, fontWeight: 'bold' }}>Bar Chart</Text>
          <BarChart
            data={data}
            barWidth={30}
            barBorderRadius={4}
            frontColor="#177AD5"
            xAxisLabelTextStyle={{ color: 'gray' }}
            yAxisTextStyle={{ color: 'gray' }}
            yAxisLabelSuffix="m"
            yAxisLabelWidth={30}
            noOfSections={4}
          />
          {/* X-axis title */}
          <Text style={{ textAlign: 'center', marginTop: 10 }}>100m splits</Text>
        </View>
      </View>
    </View>
      )}
      
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
