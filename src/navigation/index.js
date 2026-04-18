import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import ScreenshotsScreen from '../screens/ScreenshotsScreen';
import ScreenshotDetailScreen from '../screens/ScreenshotDetailScreen';
import LinksScreen from '../screens/LinksScreen';
import NotesScreen from '../screens/NotesScreen';
import NoteEditorScreen from '../screens/NoteEditorScreen';
import FilesScreen from '../screens/FilesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Screenshots Stack
const ScreenshotsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="ScreenshotsList" component={ScreenshotsScreen} options={{ title: 'Screenshots' }} />
    <Stack.Screen name="ScreenshotDetail" component={ScreenshotDetailScreen} options={{ title: 'Detail' }} />
  </Stack.Navigator>
);

// Links Stack
const LinksStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="LinksList" component={LinksScreen} options={{ title: 'Links' }} />
  </Stack.Navigator>
);

// Notes Stack
const NotesStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="NotesList" component={NotesScreen} options={{ title: 'Notes' }} />
    <Stack.Screen name="NoteEditor" component={NoteEditorScreen} options={{ title: 'Edit Note' }} />
  </Stack.Navigator>
);

// Files Stack
const FilesStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="FilesList" component={FilesScreen} options={{ title: 'Files' }} />
  </Stack.Navigator>
);

export const RootNavigator = () => (
  <NavigationContainer>
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Screenshots" component={ScreenshotsStack} />
      <Tab.Screen name="Links" component={LinksStack} />
      <Tab.Screen name="Notes" component={NotesStack} />
      <Tab.Screen name="Files" component={FilesStack} />
    </Tab.Navigator>
  </NavigationContainer>
);

