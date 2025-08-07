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
  showPhonetic = false,
  showTick = false,
  targetLang = 'japanese',
}) {
  if (!word || typeof word !== 'object') {
    console.warn('Invalid word:', word);
    return null;
  }

  const [sound, setSound] = useState(null);

  const refreshProgress = async () => {
    const updated = await loadProgress();
    onUpdateProgress?.(updated);
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
    const audioKey = word[`audio${capitalize(targetLang)}`];

    if (!audioKey || !audioMap[audioKey]) {
      console.warn('⚠️ Audio not found for:', audioKey);
      return;
    }

    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      const { sound: newSound } = await Audio.Sound.createAsync(audioMap[audioKey]);
      setSound(newSound);
      await newSound.replayAsync();
    } catch (err) {
      console.warn('❌ Audio playback error:', err.message);
    }
  };

  const tickColor = wordStage >= 2 ? '#00FF00' : 'gray';
  const langKey = targetLang.toLowerCase();
  const phoneticKey = `${langKey}Phonetic`;

  return (
    <View style={styles.item}>
      {/* English: triggers navigation */}
      <TouchableOpacity onPress={onPress} style={styles.englishZone}>
        <Text style={styles.english}>{word.english}</Text>
      </TouchableOpacity>

      {/* Foreign text: triggers audio */}
      <View style={styles.foreignZone}>
        <TouchableOpacity onPress={handlePlay} style={styles.foreignWrapper}>
          <Text style={styles.foreign}>{word[langKey]}</Text>
          {showPhonetic && word[phoneticKey] && (
            <Text style={styles.phonetic}>{word[phoneticKey]}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Tick */}
      {showTick && (
        <TouchableOpacity onPress={handleToggleStage} style={styles.tickButton}>
          <Feather name="check-circle" size={26} color={tickColor} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
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
    color: '#FFFFFF',
    fontWeight: '600',
  },
  foreignZone: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 16,
  },
  foreignWrapper: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  foreign: {
    fontSize: 18,
    color: '#aaa',
    textAlign: 'left',
  },
  phonetic: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  tickButton: {
    padding: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
});
