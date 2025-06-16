// components/BottomNav.js

import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BottomNav({ active }) {
  const navigation = useNavigation();
  const tabs = [
    { name: 'Explore', route: 'Explore' },
    { name: 'Search', route: 'Find' }, // Correct top-level tab name
  ];

  return (
    <View style={styles.navBar}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.route}
          onPress={() => navigation.navigate(tab.route)}
        >
          <Text style={[styles.tab, active === tab.route.toLowerCase() && styles.active]}>
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#111',
    paddingVertical: 10,
  },
  tab: {
    color: '#888',
    fontSize: 16,
  },
  active: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
});
