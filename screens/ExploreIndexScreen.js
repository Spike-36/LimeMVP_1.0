import { useNavigation } from '@react-navigation/native';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import blocks from '../data/blocks.json';

const getCategories = () => {
  const types = blocks.map((b) => b.type).filter(Boolean);
  return Array.from(new Set(types)).sort();
};

export default function ExploreIndexScreen() {
  const navigation = useNavigation();
  const categories = getCategories();

  const handleSelect = (type) => {
    navigation.navigate('ExploreList', { scrollToType: type });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Choose a Word Type</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelect(item)} style={styles.item}>
            <Text style={styles.itemText}>{item}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black', paddingTop: 60 },
  heading: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  list: {
    paddingHorizontal: 20,
  },
  item: {
    paddingVertical: 16,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  itemText: {
    fontSize: 20,
    color: '#FFD700',
    textTransform: 'capitalize',
  },
});
