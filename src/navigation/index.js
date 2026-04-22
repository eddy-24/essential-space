import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import ScreenshotDetailScreen from '../screens/ScreenshotDetailScreen';
import EditScreenshotScreen from '../screens/EditScreenshotScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0a0a0a' } }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ScreenshotDetail" component={ScreenshotDetailScreen} />
        <Stack.Screen name="EditScreenshot" component={EditScreenshotScreen} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
