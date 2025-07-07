import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ExploreIndexScreen from './ExploreIndexScreen';
import ExploreListScreen from './ExploreListScreen';
import WordRecordScreen from './WordRecordScreen';

const Stack = createNativeStackNavigator();

export default function ExploreStack() {
  return (
    <Stack.Navigator
      initialRouteName="ExploreIndex"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: 'black' },
      }}
    >
      <Stack.Screen name="ExploreIndex" component={ExploreIndexScreen} />
      <Stack.Screen name="ExploreList" component={ExploreListScreen} />
      <Stack.Screen name="WordRecord" component={WordRecordScreen} />
    </Stack.Navigator>
  );
}
