import { Entypo, Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import ExploreStack from './screens/ExploreStack'; // ✅ NEW
// ❌ NO NEED TO import WordRecordScreen here

const Tab = createBottomTabNavigator();

const Dummy = ({ label }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' }}>
    <Text style={{ color: '#fff', fontSize: 18 }}>{label} screen coming soon</Text>
  </View>
);

export default function App() {
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('savedWords');
        console.log('❤️ Saved Words:', JSON.parse(saved));
      } catch (err) {
        console.error('⚠️ Failed to load savedWords:', err);
      }
    })();
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Explore"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#FFD700',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: { backgroundColor: 'black', borderTopColor: '#222' },
          tabBarLabelStyle: { fontSize: 12 },
        }}
      >
        <Tab.Screen
          name="Find"
          children={() => <Dummy label="Find" />}
          options={{ tabBarIcon: ({ color, size }) => <Feather name="search" size={size} color={color} /> }}
        />
        <Tab.Screen
          name="Explore"
          component={ExploreStack} // ✅ Use stack here
          options={{ tabBarIcon: ({ color, size }) => <Entypo name="grid" size={size} color={color} /> }}
        />
        <Tab.Screen
          name="Listen"
          children={() => <Dummy label="Listen" />}
          options={{ tabBarIcon: ({ color, size }) => <FontAwesome5 name="headphones" size={size} color={color} /> }}
        />
        <Tab.Screen
          name="Speak"
          children={() => <Dummy label="Speak" />}
          options={{ tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="microphone" size={size} color={color} /> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
