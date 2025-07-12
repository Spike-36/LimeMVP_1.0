import { Feather } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { audioMap } from '../components/audioMap';
import { loadProgress, updateWordStage } from '../utils/progressStorage';

export default function WordListItem({
  word,
  wordStage = 0,
  onPress,
  onUpdateProgress,
}) {
  if (!word || typeof word !== 'object') {
    console.warn('Invalid word:', word);
    return null;
  }

  const [sound, setSound] = useState(null);

  const refreshProgress = async () => {
    const updated = await loadProgress();
    onUpdateProgress(updated);
  };

  const handleToggleStage = () => {
    if (!word?.id || !onUpdateProgress) return;

    const newStage = wordStage >= 2 ? 0 : 2;

    const doUpdate = async () => {
      await updateWordStage(word.id, newStage, true);
      await refreshProgress();
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

  const handlePlay = async () => {
    if (!word.audio || !audioMap[word.audio]) {
      console.warn('⚠️ Audio not found for:', word.audio);
      return;
    }

    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      const { sound: newSound } = await Audio.Sound.createAsync(audioMap[word.audio]);
      setSound(newSound);
      await newSound.replayAsync();
    } catch (err) {
      console.warn('❌ Audio playback error:', err.message);
    }
  };

  const tickColor = wordStage >= 2 ? '#00FF00' : 'gray';

  return (
    <View style={styles.item}>
      {/* English: triggers navigation */}
      <TouchableOpacity onPress={onPress} style={styles.englishZone}>
        <Text style={styles.english}>{word.english}</Text>
      </TouchableOpacity>

      {/* Japanese: triggers audio */}
      <View style={styles.japaneseZone}>
        <TouchableOpacity onPress={handlePlay} style={styles.japaneseWrapper}>
          <Text style={styles.japanese}>{word.foreign}</Text>
        </TouchableOpacity>
      </View>

      {/* Tick */}
      <TouchableOpacity onPress={handleToggleStage} style={styles.tickButton}>
        <Feather name="check-circle" size={26} color={tickColor} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#1c1c1c',
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  englishZone: {
    width: 130,
    marginRight: 8,
  },
  english: {
    fontSize: 18,
     color: '#FFFFFF', // white
    fontWeight: '600',
  },
  japaneseZone: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 16,
  },
  japaneseWrapper: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  japanese: {
    fontSize: 18,
    color: '#aaa',
    textAlign: 'left',
  },
  tickButton: {
    padding: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
});
