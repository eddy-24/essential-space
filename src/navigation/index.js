import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Svg, { Rect, Path, Circle, Line } from 'react-native-svg';

import ScreenshotsScreen from '../screens/ScreenshotsScreen';
import ScreenshotDetailScreen from '../screens/ScreenshotDetailScreen';
import LinksScreen from '../screens/LinksScreen';
import NotesScreen from '../screens/NotesScreen';
import NoteEditorScreen from '../screens/NoteEditorScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// SVG Icons (22x22 viewBox, 28x28 size, strokeWidth 1.3)
const ShotsIcon = ({ color }) => (
  <Svg width="28" height="28" viewBox="0 0 22 22" fill="none">
    <Rect x="3" y="3" width="6.5" height="6.5" rx="1.5" stroke={color} strokeWidth="1.3" />
    <Rect x="12.5" y="3" width="6.5" height="6.5" rx="1.5" stroke={color} strokeWidth="1.3" />
    <Rect x="3" y="12.5" width="6.5" height="6.5" rx="1.5" stroke={color} strokeWidth="1.3" />
    <Rect x="12.5" y="12.5" width="6.5" height="6.5" rx="1.5" stroke={color} strokeWidth="1.3" />
  </Svg>
);

const LinksIcon = ({ color }) => (
  <Svg width="28" height="28" viewBox="0 0 22 22" fill="none">
    <Path d="M2 6C2 3.79086 3.79086 2 6 2H16C18.2091 2 20 3.79086 20 6V12C20 14.2091 18.2091 16 16 16H8L2 20V6Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
  </Svg>
);

const NotesIcon = ({ color }) => (
  <Svg width="28" height="28" viewBox="0 0 22 22" fill="none">
    <Line x1="3" y1="5" x2="19" y2="5" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    <Line x1="3" y1="11" x2="19" y2="11" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    <Line x1="3" y1="17" x2="13" y2="17" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
  </Svg>
);



const ScreenshotsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ScreenshotsList" component={ScreenshotsScreen} />
    <Stack.Screen name="ScreenshotDetail" component={ScreenshotDetailScreen} />
  </Stack.Navigator>
);

const LinksStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="LinksList" component={LinksScreen} />
  </Stack.Navigator>
);

const NotesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="NotesList" component={NotesScreen} />
    <Stack.Screen name="NoteEditor" component={NoteEditorScreen} />
  </Stack.Navigator>
);


export const RootNavigator = () => (
  <NavigationContainer>
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 96,
          backgroundColor: '#0d0d0d',
          borderTopWidth: 0.5,
          borderTopColor: '#1e1e1e',
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#f0f0f0',
        tabBarInactiveTintColor: '#333',
        tabBarIcon: ({ color, focused }) => {
          let Icon;
          if (route.name === 'shots') Icon = ShotsIcon;
          else if (route.name === 'links') Icon = LinksIcon;
          else if (route.name === 'notes') Icon = NotesIcon;

          return (
            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
              <Icon color={color} />
              <View style={{ width: 20, height: 1.5, backgroundColor: focused ? '#f0f0f0' : 'transparent', marginTop: 6, borderRadius: 1 }} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="shots" component={ScreenshotsStack} />
      <Tab.Screen name="links" component={LinksStack} />
      <Tab.Screen name="notes" component={NotesStack} />
    </Tab.Navigator>
  </NavigationContainer>
);
