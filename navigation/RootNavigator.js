import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import FindStack from '../screens/FindStack'; // Your existing Find stack
import MainTabs from './MainTabs'; // This is your current Tab Navigator (Explore, Learn, etc)

const RootStack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs" component={MainTabs} />
        <RootStack.Screen
          name="Find"
          component={FindStack}
          options={{ presentation: 'modal' }} // or 'card' if you want full screen
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
