import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import InboxScreen from '../screens/InboxScreen';
import CollectionsScreen from '../screens/CollectionsScreen';
import CollectionScreen from '../screens/CollectionScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Inbox"       component={InboxScreen} />
    <Tab.Screen name="Collections" component={CollectionsScreen} />
  </Tab.Navigator>
);

export const RootNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main"           component={MainTabs} />
      <Stack.Screen name="ItemDetail"     component={ItemDetailScreen}
        options={{ presentation: 'modal' }} />
      <Stack.Screen name="Collection"     component={CollectionScreen} />
      <Stack.Screen name="Settings"       component={SettingsScreen}
        options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  </NavigationContainer>
);
