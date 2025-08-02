// screens/HomeScreen.js

import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useTargetLang } from '../context/TargetLangContext'; // ✅ using global context

const HomeScreen = () => {
  const navigation = useNavigation();
  const { targetLang, setTargetLang } = useTargetLang(); // ✅ shared context

  const handleToggle = () => {
    setTargetLang(prev => (prev === 'korean' ? 'japanese' : 'korean'));
  };

  const goToWordScreen = () => {
    navigation.navigate('WordRecord', {
      words: [], // 🔧 plug in a real list if needed
      index: 0,
      mode: 'explore',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome to Lime</Text>
      <Text style={styles.subtext}>Choose a tab to get started</Text>

      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>
          Target Language: {targetLang === 'korean' ? 'Korean' : 'Japanese'}
        </Text>
        <Switch
          value={targetLang === 'japanese'}
          onValueChange={handleToggle}
          thumbColor="#FFD700"
          trackColor={{ false: '#888', true: '#444' }}
        />
      </View>

      <TouchableOpacity style={styles.testButton} onPress={goToWordScreen}>
        <Text style={styles.testButtonText}>Test Word Screen →</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: '40%',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtext: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
  toggleContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  testButton: {
    marginTop: 60,
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default HomeScreen;
