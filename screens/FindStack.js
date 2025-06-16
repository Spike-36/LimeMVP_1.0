// screens/FindStack.js

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FindWordRecord from './FindWordRecord';
import VoiceSearchScreen from './VoiceSearchScreen';

const Stack = createNativeStackNavigator();

export default function FindStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: 'black' },
      }}
    >
      <Stack.Screen name="VoiceSearch" component={VoiceSearchScreen} />
      <Stack.Screen name="FindWordRecord" component={FindWordRecord} />
    </Stack.Navigator>
  );
}
