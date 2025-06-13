import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WordListItem({ word, onPress }) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View>
        <Text style={styles.term}>{word.term}</Text>
        <Text style={styles.translation}>{word.translation}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 16,
    backgroundColor: '#1c1c1c',
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  term: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: '600',
  },
  translation: {
    fontSize: 16,
    color: '#aaa',
    marginTop: 4,
  },
});
