// screens/ReviewStack.js

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ReviewScreen from './ReviewScreen';
import ReviewWordScreen from './ReviewWordScreen';

const Stack = createNativeStackNavigator();

export default function ReviewStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ReviewMain" component={ReviewScreen} />
      <Stack.Screen name="ReviewWord" component={ReviewWordScreen} />
    </Stack.Navigator>
  );
}
