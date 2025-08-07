import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const LANGUAGES = [
  { key: 'japanese', label: '🇯🇵 Japanese', available: true },
  { key: 'korean', label: '🇰🇷 Korean', available: true },
  { key: 'french', label: '🇫🇷 French', available: false },
  { key: 'spanish', label: '🇪🇸 Spanish', available: false },
  { key: 'thai', label: '🇹🇭 Thai', available: false },
  { key: 'turkish', label: '🇹🇷 Turkish', available: false },
];

export default function LanguagePickerScreen({ navigation }) {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const loadLang = async () => {
      const stored = await AsyncStorage.getItem('targetLang');
      if (stored) setSelected(stored);
    };
    loadLang();
  }, []);

  const selectLang = async (langKey, available) => {
    if (!available) {
      Alert.alert('Coming Soon!', 'This language is not available yet.');
      return;
    }

    await AsyncStorage.setItem('targetLang', langKey);
    setSelected(langKey);
    navigation.navigate('Explore', { targetLang: langKey });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.option,
        selected === item.key && item.available && styles.selected,
        !item.available && styles.disabled,
      ]}
      onPress={() => selectLang(item.key, item.available)}
    >
      <Text style={styles.label}>{item.label}</Text>
      {!item.available && <Text style={styles.sublabel}>Coming Soon</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Choose a Language</Text>
      <FlatList data={LANGUAGES} renderItem={renderItem} keyExtractor={item => item.key} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 20 },
  heading: { fontSize: 24, color: '#fff', marginBottom: 20 },
  option: {
    padding: 15,
    backgroundColor: '#333',
    marginBottom: 10,
    borderRadius: 6,
  },
  selected: {
    backgroundColor: '#ffd700',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: '#fff',
    fontSize: 18,
  },
  sublabel: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 4,
  },
});
