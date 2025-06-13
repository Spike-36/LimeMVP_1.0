import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WordRecordScreen({ route, navigation }) {
  const { words, index } = route.params;
  const word = words[index];

  const goNext = () => {
    if (index < words.length - 1) {
      navigation.push('WordRecord', { words, index: index + 1 });
    }
  };

  const goPrev = () => {
    if (index > 0) {
      navigation.push('WordRecord', { words, index: index - 1 });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.term}>{word.term}</Text>
      <Text style={styles.translation}>{word.translation}</Text>
      <Text style={styles.phonetic}>{word.phonetic}</Text>

      <View style={styles.navButtons}>
        <TouchableOpacity onPress={goPrev} disabled={index === 0}>
          <Text style={[styles.navText, index === 0 && styles.disabled]}>◀ Prev</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goNext} disabled={index === words.length - 1}>
          <Text style={[styles.navText, index === words.length - 1 && styles.disabled]}>Next ▶</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  term: {
    fontSize: 32,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  translation: {
    fontSize: 28,
    color: 'white',
    marginBottom: 8,
  },
  phonetic: {
    fontSize: 20,
    color: '#aaa',
  },
  navButtons: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 40,
  },
  navText: {
    fontSize: 18,
    color: '#FFD700',
  },
  disabled: {
    color: '#555',
  },
});
