import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { imageMap } from '../components/imageMap';
import useForeignAudio from '../hooks/useForeignAudio';
import { loadProgress, updateWordStage } from '../utils/progressStorage';

export default function WordListItem({
  word,
  wordStage = 0,
  onPress,
  onUpdateProgress,
  showTickBackground = false,
  showImage = true,
}) {
  if (!word || typeof word !== 'object') {
    console.warn('Invalid word:', word);
    return null;
  }

  const [isTicking, setIsTicking] = useState(false);
  const imageSource = imageMap[word.image];
  const { playAudio, isLoaded } = useForeignAudio(word); // ✅ grab isLoaded

  const refreshProgress = async () => {
    const updated = await loadProgress();
    onUpdateProgress(updated);
  };

  const handleToggleStage = () => {
    if (!word?.id || !onUpdateProgress) return;

    const newStage = wordStage >= 1 ? 0 : 2;

    const doUpdate = async () => {
      setIsTicking(true);
      await updateWordStage(word.id, newStage, true);
      await refreshProgress();
      setIsTicking(false);
    };

    if (newStage === 0) {
      Alert.alert(
        'Remove tick?',
        'This will reset progress for this word.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Yes', onPress: doUpdate },
        ],
        { cancelable: true }
      );
    } else {
      doUpdate();
    }
  };

  const handlePlay = () => {
    if (word.audio && isLoaded) {
      playAudio();
    } else {
      console.warn('⚠️ Tried to play before sound was loaded (WordListItem)');
    }
  };

  const tickColor = wordStage >= 2 ? '#00FF00' : 'gray';
  const tickStyle = showTickBackground
    ? [styles.tickButton, { backgroundColor: 'rgba(255,255,255,0.15)' }]
    : styles.tickButton;

  return (
    <View style={styles.item}>
      <TouchableOpacity style={styles.leftArea} onPress={onPress}>
        {showImage && imageSource && (
          <Image source={imageSource} style={styles.image} resizeMode="contain" />
        )}
        <Text style={styles.term}>{word.english}</Text>
      </TouchableOpacity>

      <View style={styles.rightCluster}>
        <TouchableOpacity
          onPress={handlePlay}
          style={styles.translationWrapper}
          disabled={!isLoaded} // ✅ optional: disables while loading
        >
          <Text style={[styles.translation, !isLoaded && { opacity: 0.4 }]}>
            {word.foreign}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleToggleStage} style={tickStyle}>
          <Feather name="check-circle" size={26} color={tickColor} />
        </TouchableOpacity>
      </View>
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
  leftArea: {
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
  term: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: '600',
  },
  rightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  translationWrapper: {
    maxWidth: 120,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  translation: {
    fontSize: 18,
    color: '#aaa',
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  tickButton: {
    padding: 6,
    borderRadius: 20,
  },
});
