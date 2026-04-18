import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Svg, { Rect, Path, Circle, Line } from 'react-native-svg';

import ScreenshotsScreen from '../screens/ScreenshotsScreen';
import ScreenshotDetailScreen from '../screens/ScreenshotDetailScreen';
import LinksScreen from '../screens/LinksScreen';
import NotesScreen from '../screens/NotesScreen';
import NoteEditorScreen from '../screens/NoteEditorScreen';
import FilesScreen from '../screens/FilesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// SVG Icons (14x14 stroke only)
const ShotsIcon = ({ color }) => (
  <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <Rect x="1" y="1" width="5" height="5" rx="1" stroke={color} strokeWidth="1" />
    <Rect x="8" y="1" width="5" height="5" rx="1" stroke={color} strokeWidth="1" />
    <Rect x="1" y="8" width="5" height="5" rx="1" stroke={color} strokeWidth="1" />
    <Rect x="8" y="8" width="5" height="5" rx="1" stroke={color} strokeWidth="1" />
  </Svg>
);

const LinksIcon = ({ color }) => (
  <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <Path d="M1 4C1 2.34315 2.34315 1 4 1H10C11.6569 1 13 2.34315 13 4V8C13 9.65685 11.6569 11 10 11H5L1 13V4Z" stroke={color} strokeWidth="1" />
  </Svg>
);

const NotesIcon = ({ color }) => (
  <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <Line x1="1" y1="3" x2="13" y2="3" stroke={color} strokeWidth="1" />
    <Line x1="1" y1="7" x2="13" y2="7" stroke={color} strokeWidth="1" />
    <Line x1="1" y1="11" x2="9" y2="11" stroke={color} strokeWidth="1" />
  </Svg>
);

const FilesIcon = ({ color }) => (
  <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <Path d="M2 1V13H12V5L8 1H2Z" stroke={color} strokeWidth="1" />
    <Path d="M8 1V5H12" stroke={color} strokeWidth="1" />
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

const FilesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FilesList" component={FilesScreen} />
  </Stack.Navigator>
);

export const RootNavigator = () => (
  <NavigationContainer>
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 44,
          backgroundColor: '#0d0d0d',
          borderTopWidth: 0.5,
          borderTopColor: '#1e1e1e',
        },
        tabBarActiveTintColor: '#f0f0f0',
        tabBarInactiveTintColor: '#444',
        tabBarLabelStyle: {
          fontFamily: 'DM Mono',
          fontSize: 6,
          marginBottom: 4,
        },
        tabBarIcon: ({ color }) => {
          if (route.name === 'shots') return <ShotsIcon color={color} />;
          if (route.name === 'links') return <LinksIcon color={color} />;
          if (route.name === 'notes') return <NotesIcon color={color} />;
          if (route.name === 'files') return <FilesIcon color={color} />;
        },
      })}
    >
      <Tab.Screen name="shots" component={ScreenshotsStack} />
      <Tab.Screen name="links" component={LinksStack} />
      <Tab.Screen name="notes" component={NotesStack} />
      <Tab.Screen name="files" component={FilesStack} />
    </Tab.Navigator>
  </NavigationContainer>
);
