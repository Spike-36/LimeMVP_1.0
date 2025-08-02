import { Entypo, Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { useEffect } from 'react';

import { TargetLangProvider } from './context/TargetLangContext'; // ✅ ADD THIS
import ExploreStack from './screens/ExploreStack';
import FindStack from './screens/FindStack';
import HomeScreen from './screens/HomeScreen';
import PracticeListenScreen from './screens/PracticeListenScreen';
import PracticeSpeakScreen from './screens/PracticeSpeakScreen';
import ReviewStack from './screens/ReviewStack';

const Tab = createBottomTabNavigator();

export default function App() {
  useEffect(() => {
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          interruptionModeIOS: 'doNotMix',
          interruptionModeAndroid: 'doNotMix',
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (err) {
        console.warn('Audio mode setup failed:', err);
      }
    };

    configureAudio();
  }, []);

  return (
    <TargetLangProvider> {/* ✅ WRAPS EVERYTHING */}
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#FFD700',
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: { backgroundColor: 'black', borderTopColor: '#222' },
            tabBarLabelStyle: { fontSize: 12 },
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarLabel: 'Home',
              tabBarIcon: ({ color, size }) => (
                <Entypo name="home" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Explore"
            component={ExploreStack}
            options={{
              tabBarLabel: 'Level 1',
              tabBarIcon: ({ color, size }) => (
                <Entypo name="grid" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Listen"
            component={PracticeListenScreen}
            options={{
              tabBarLabel: 'Level 2',
              tabBarIcon: ({ color, size }) => (
                <FontAwesome5 name="headphones" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Speak"
            component={PracticeSpeakScreen}
            options={{
              tabBarLabel: 'Level 3',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="microphone" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Review"
            component={ReviewStack}
            options={{
              tabBarLabel: 'Level 4',
              tabBarIcon: ({ color, size }) => (
                <Feather name="check-circle" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Find"
            component={FindStack}
            options={{
              tabBarButton: () => null,
              tabBarItemStyle: { display: 'none' },
              tabBarLabel: () => null,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </TargetLangProvider>
  );
}
