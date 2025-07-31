
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type StatsContainerProps = {
  children: React.ReactNode
};

export const StatsContainer: React.FC<StatsContainerProps> = ({ children }) => {
  return (
    <View style={styles.statsContainer}>
      {children}
    </View>
  );
};

type StatCardProps = {
  label: string;
  value: string | number; // Allow both string and number types
};

export const StatCard: React.FC<StatCardProps> = ({ label, value }) => {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
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
});