// App.js
import { Entypo, Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import ExploreStack from './screens/ExploreStack';
import FindStack from './screens/FindStack';
import LearnWordScreen from './screens/LearnWordScreen';
import PracticeListenScreen from './screens/PracticeListenScreen';
import PracticeSpeakScreen from './screens/PracticeSpeakScreen';
import ReviewScreen from './screens/ReviewScreen';

const Tab = createBottomTabNavigator();

export default function App() {
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
          name="Explore"
          component={ExploreStack}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Entypo name="grid" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Learn"
          component={LearnWordScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="book-open-variant" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Listen"
          component={PracticeListenScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <FontAwesome5 name="headphones" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Speak"
          component={PracticeSpeakScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="microphone" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Review"
          component={ReviewScreen}
          options={{
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
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
