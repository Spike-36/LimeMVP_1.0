// screens/FindWordRecord.js

import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { audioMap } from '../components/audioMap';
import { imageMap } from '../components/imageMap';
import WordRecordLayout from '../components/WordRecordLayout';

export default function FindWordRecord({ route }) {
  const word = route.params?.word;
  const [sound, setSound] = useState(null);
  const [showEnglish, setShowEnglish] = useState(false);
  const [showTip, setShowTip] = useState(false);

  const audioAsset = word ? audioMap[word.audio] : null;
  const imageAsset = word ? imageMap[word.image] : null;

  useEffect(() => {
    let loadedSound;

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

  const playAudio = async () => {
    if (sound) {
      try {
        await sound.replayAsync();
      } catch (e) {
        console.warn('⚠️ Audio playback error:', e);
      }
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

      <WordRecordLayout
        block={word}
        imageAsset={imageAsset}
        showImage={true}
        showTipIcon={true}
        showInfoIcon={true}
        showEnglish={showEnglish}
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
});
