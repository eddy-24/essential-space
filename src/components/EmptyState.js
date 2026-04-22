import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const Icons = {
  shots: ({ color }) => (
    <Svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <Circle cx="12" cy="13" r="4" />
    </Svg>
  ),
  notes: ({ color }) => (
    <Svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <Path d="M14 2v6h6" />
      <Path d="M16 13H8" />
      <Path d="M16 17H8" />
      <Path d="M10 9H8" />
    </Svg>
  ),
  links: ({ color }) => (
    <Svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <Path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </Svg>
  )
};

export const EmptyState = ({ type = 'notes', message = 'Nothing here yet.' }) => {
  const Icon = Icons[type] || Icons.notes;
  
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon color="#444" />
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 100, // Offset to account for headers
  },
  iconContainer: {
    marginBottom: 20,
    opacity: 0.8,
  },
  message: {
    fontFamily: 'DM Sans',
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  }
});
