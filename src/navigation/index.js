import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import GalleryScreen from '../screens/GalleryScreen';
import ScreenshotDetailScreen from '../screens/ScreenshotDetailScreen';
import EditScreenshotScreen from '../screens/EditScreenshotScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Material Symbols via unicode — we use text icons since we can't load web fonts in RN
// Using simple geometric SVG-style text representations
const HomeIcon = ({ color }) => (
  <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: 14, height: 10, borderWidth: 1.5, borderColor: color, borderTopLeftRadius: 2, borderTopRightRadius: 2 }} />
    <View style={{ width: 8, height: 8, borderWidth: 1.5, borderColor: color, marginTop: -1 }} />
    <View style={[{ position: 'absolute', top: 0, width: 22, height: 12, borderLeftWidth: 1.5, borderRightWidth: 1.5, borderTopWidth: 1.5, borderColor: color, borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: 'transparent' }]} />
  </View>
);

const GridIcon = ({ color }) => (
  <View style={{ width: 22, height: 22, flexDirection: 'row', flexWrap: 'wrap', gap: 3 }}>
    {[0,1,2,3].map(i => (
      <View key={i} style={{ width: 9, height: 9, borderWidth: 1, borderColor: color }} />
    ))}
  </View>
);

const SettingsIcon = ({ color }) => (
  <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, borderWidth: 1.5, borderColor: color }} />
    </View>
  </View>
);

function CustomTabBar({ state, navigation }) {
  const icons = [HomeIcon, GridIcon, SettingsIcon];

  return (
    <View style={tabStyles.bar}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const Icon = icons[index];

        return (
          <TouchableOpacity
            key={route.key}
            style={[tabStyles.tab, isFocused && tabStyles.tabActive]}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}
          >
            <Icon color={isFocused ? '#000000' : 'rgba(255,255,255,0.4)'} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    height: 80,
    paddingBottom: 16,
  },
  tab: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#ffffff',
  },
});

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Gallery" component={GalleryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#131313' } }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="ScreenshotDetail" component={ScreenshotDetailScreen} />
        <Stack.Screen name="EditScreenshot" component={EditScreenshotScreen} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
