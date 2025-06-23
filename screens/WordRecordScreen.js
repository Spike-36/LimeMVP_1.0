import { Feather, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { audioMap } from '../components/audioMap';
import { imageMap } from '../components/imageMap';
import WordRecordLayout from '../components/WordRecordLayout';
import { getStage, loadProgress, updateWordStage } from '../utils/progressStorage';

export default function WordRecordScreen({ route }) {
  const navigation = useNavigation();
  const words = route.params?.words || [];
  const index = route.params?.index ?? 0;
  const word = words[index];

  const [sound, setSound] = useState(null);
  const [showEnglish, setShowEnglish] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [progress, setProgress] = useState({});

  const wordId = word?.id;
  const stage = getStage(progress, wordId);

  useEffect(() => {
    const fetchProgress = async () => {
      const data = await loadProgress();
      setProgress(data);
    };
    fetchProgress();
  }, []);

  const handleSetStage = async (newStage) => {
    if (!wordId) return;
    await updateWordStage(wordId, newStage);
    const updated = await loadProgress();
    setProgress(updated);
  };

  useEffect(() => {
    let loadedSound;
    const audioAsset = word?.audio && audioMap[word.audio];

    const loadAudio = async () => {
      if (audioAsset) {
        try {
          const { sound: newSound } = await Audio.Sound.createAsync(audioAsset);
          setSound(newSound);
          loadedSound = newSound;
        } catch (err) {
          console.warn('❌ Failed to preload audio:', err);
        }
      }
    };

    loadAudio();

    return () => {
      if (loadedSound) {
        loadedSound.unloadAsync();
      }
    };
  }, [word?.audio]);

  useEffect(() => {
    if (sound) {
      sound.replayAsync().catch((e) => {
        console.warn('⚠️ Auto-play error:', e);
      });
    }
  }, [sound]);

  const imageAsset = word ? imageMap[word.image] : null;

  const playAudio = async () => {
    if (sound) {
      try {
        await sound.replayAsync();
      } catch (e) {
        console.warn('⚠️ Audio playback error:', e);
      }
    }
  };

  const goToPrev = () => {
    if (index > 0) {
      navigation.replace('WordRecord', {
        words,
        index: index - 1,
      });
    }
  };

  const goToNext = () => {
    if (index < words.length - 1) {
      navigation.replace('WordRecord', {
        words,
        index: index + 1,
      });
    }
  };

  if (!word) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>⚠️ Word not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <View style={styles.stageStars}>
        {[0, 1, 2, 3].map((level) => (
          <TouchableOpacity
            key={level}
            onPress={() => handleSetStage(level + 1)}
          >
            <FontAwesome
              name={stage > level ? 'star' : 'star-o'}
              size={24}
              color={stage > level ? '#FFD700' : '#555'}
              style={{ marginLeft: 2 }}
            />
          </TouchableOpacity>
        ))}
      </View>

      <WordRecordLayout
        block={word}
        imageAsset={imageAsset}
        showImage={true}
        showTipIcon={true}
        showInfoIcon={true}
        showEnglish={showEnglish}
        hideAudioButton={true}
        onPlayAudio={playAudio}
        onToggleEnglish={() => setShowEnglish(!showEnglish)}
        onShowTip={() => setShowTip(true)}
      />

      {showTip && (
        <View style={styles.tipOverlay}>
          <Text style={styles.tipText}>{word.tip}</Text>
          <Text style={styles.closeTip} onPress={() => setShowTip(false)}>✕</Text>
        </View>
      )}

      <View style={styles.navButtons}>
        <TouchableOpacity onPress={goToPrev} disabled={index === 0}>
          <View style={{ transform: [{ scaleY: 1.4 }] }}>
            <Feather
              name="chevron-left"
              size={48}
              color={index === 0 ? 'gray' : '#888'}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={goToNext} disabled={index === words.length - 1}>
          <View style={{ transform: [{ scaleY: 1.4 }] }}>
            <Feather
              name="chevron-right"
              size={48}
              color={index === words.length - 1 ? 'gray' : '#888'}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  error: {
    marginTop: 40,
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  stageStars: {
    position: 'absolute',
    top: 70,
    right: 20,
    zIndex: 20,
    flexDirection: 'row',
  },
  tipOverlay: {
    position: 'absolute',
    top: '30%',
    left: 20,
    right: 20,
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 12,
    zIndex: 999,
  },
  tipText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  closeTip: {
    color: '#FFD700',
    fontSize: 22,
    textAlign: 'center',
    marginTop: 16,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 60,
  },
});