import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { audioMap } from '../components/audioMap';
import { imageMap } from '../components/imageMap';
import WordInteractionBlock from '../components/WordInteractionBlock';
import WordRecordLayout from '../components/WordRecordLayout';

export default function FindWordRecord({ route }) {
  const navigation = useNavigation();
  const word = route.params?.word;
  const [showEnglish, setShowEnglish] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const soundRef = useRef(null);

  useEffect(() => {
    if (!word?.audio) return;

    let isMounted = true;

    const loadAndPlay = async () => {
      try {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current.setOnPlaybackStatusUpdate(null);
          soundRef.current = null;
        }

        const { sound } = await Audio.Sound.createAsync(audioMap[word.audio]);
        soundRef.current = sound;

        if (isMounted) {
          await sound.playAsync();
        }
      } catch (err) {
        console.warn('❌ Find audio error:', err.message);
      }
    };

    loadAndPlay();

    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [word?.id]);

  const playAudio = async () => {
    if (!soundRef.current) return;
    try {
      await soundRef.current.replayAsync();
    } catch (err) {
      console.warn('⚠️ Replay failed:', err.message);
    }
  };

  const playSlowAudio = async () => {
    const key = word?.audioJapaneseSlow || word?.audioSlow;
    const source = audioMap[key];

    console.log('🐢 Slow audio key:', key);
    console.log('📦 audioMap entry:', source);

    if (!key || !source) {
      console.warn('⚠️ No slow audio found:', key);
      Alert.alert('Audio Missing', 'No slow audio available for this word.');
      return;
    }

    try {
      const { sound } = await Audio.Sound.createAsync(source);
      await sound.playAsync();

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (err) {
      console.warn('❌ Slow audio playback error:', err.message);
    }
  };

  if (!word) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>⚠️ Word not found</Text>
      </View>
    );
  }

  const imageAsset = word.image ? imageMap[word.image] : null;

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <View style={styles.topBlock}>
        <WordRecordLayout
          block={word}
          imageAsset={imageAsset}
          showImage={true}
          showTipIcon={true}
          showInfoIcon={true}
          showEnglish={showEnglish}
          showSlowAudioIcon={true}
          onPlayAudio={playAudio}
          onSlowAudioPress={playSlowAudio}
          onToggleEnglish={() => setShowEnglish(!showEnglish)}
          onShowTip={() => setShowTip(true)}
          onPressFind={() => navigation.navigate('VoiceSearch')}
        />
      </View>

      <View style={styles.interactionBlock}>
        <WordInteractionBlock
          block={word}
          onPlayAudio={playAudio}
          showStars={false}
          showInstruction={false}
        />
      </View>

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
  topBlock: {
    height: '58%',
  },
  interactionBlock: {
    height: '42%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,
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