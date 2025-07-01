import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { imageMap } from './imageMap'; // adjust path if needed

export default function WordListItem({ word, wordStage = 0, onToggleFavorite, onPress }) {
  const imageSource = imageMap[word.image];

  // Determine star appearance based on stage
  let starName = 'star-outline';
  let starColor = '#444';

  if (wordStage === 4) {
    starName = 'star';
    starColor = '#FFD700'; // gold for review
  } else if (wordStage >= 1) {
    starName = 'star';
    starColor = 'gray'; // selected but not yet Review
  }

  return (
    <View style={styles.item}>
      <TouchableOpacity style={styles.touchableArea} onPress={onPress}>
        {imageSource && (
          <Image source={imageSource} style={styles.image} resizeMode="contain" />
        )}
        <View style={styles.textContainer}>
          <Text style={styles.term}>{word.english}</Text>
          <Text style={styles.translation}>{word.foreign}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          console.log(`⭐ Star tapped — ID: ${word.id}, Stage: ${wordStage}`);
          onToggleFavorite();
        }}
        style={styles.starButton}
      >
        <Ionicons name={starName} size={24} color={starColor} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1c1c1c',
    borderBottomColor: '#333',
    borderBottomWidth: 1,
    justifyContent: 'space-between',
  },
  touchableArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  image: {
    width: 60,
    height: 60,
    marginRight: 16,
    borderRadius: 8,
  },
  textContainer: {
    flexShrink: 1,
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
  starButton: {
    paddingLeft: 12,
  },
});
