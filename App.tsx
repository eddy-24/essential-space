import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RootNavigator } from './src/navigation/index';

export default function App() {
  return (
    <View style={styles.root}>
      <RootNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 }
});
