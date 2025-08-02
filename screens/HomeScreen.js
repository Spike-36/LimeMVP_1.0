import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

const HomeScreen = () => {
  const [isKorean, setIsKorean] = useState(true);

  const handleToggle = () => {
    setIsKorean((prev) => !prev);
    // 🔧 Replace with setTargetLang('japanese') / 'korean' once context or state is wired
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome to Lime</Text>
      <Text style={styles.subtext}>Choose a tab to get started</Text>

      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Target Language: {isKorean ? 'Korean' : 'Japanese'}</Text>
        <Switch
          value={!isKorean}
          onValueChange={handleToggle}
          thumbColor="#FFD700"
          trackColor={{ false: '#888', true: '#444' }}
        />
      </View>
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
});

export default HomeScreen;
