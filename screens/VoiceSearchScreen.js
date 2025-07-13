import { FontAwesome } from '@expo/vector-icons';
import Voice from '@react-native-voice/voice';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { closest, distance } from 'fastest-levenshtein';
import React, { useEffect, useState } from 'react';
import {
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import blocks from '../data/blocks.json';

export default function VoiceSearchScreen() {
  const navigation = useNavigation();
  const [isListening, setIsListening] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      setErrorMessage('');
      setIsListening(false);
    }, [])
  );

  useEffect(() => {
    Voice.onSpeechResults = (event) => {
      if (event.value?.[0]) {
        setTimeout(() => {
          handleTranscript(event.value[0]);
        }, 500);
      }
    };

    Voice.onSpeechError = (event) => {
      const msg = event.error?.message || 'Speech error';
      setErrorMessage('⚠️ ' + msg);
    };

    return () => {
      Voice.destroy().catch(() => {});
      Voice.removeAllListeners();
    };
  }, []);

  const startListening = async () => {
    if (isStarting || isListening) return;
    setIsStarting(true);
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      }
      await Voice.start('en-US');
      setIsListening(true);
    } catch (e) {
      setErrorMessage('⚠️ Failed to start mic: ' + e.message);
    } finally {
      setIsStarting(false);
    }
  };

  const aliasMap = {
    noodles: 'noodle',
    coffees: 'coffee',
    meet: 'meat',
    guy: 'chicken',
    moo: 'pork',
    neung: 'one',
  };

  const handleTranscript = async (rawText) => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch {}

    console.log('🎤 Raw:', rawText);

    let cleaned = rawText
      .toLowerCase()
      .replace(/[^぀-ヿ一-鿿a-z0-9\s]/g, '')
      .trim()
      .replace(/^(i said|this is|please|can i have)\s+/i, '');

    const canonical = aliasMap[cleaned] || cleaned;

    console.log('🧼 Cleaned:', cleaned);
    console.log('🔍 Canonical:', canonical);

    let bestBlock = blocks.find((b) =>
      [b.english, b.foreign, b.phonetic, ...(b.aliases || [])]
        .filter(Boolean)
        .some((f) => f?.toLowerCase() === canonical)
    );

    if (!bestBlock) {
      const phrases = cleaned.split(/\s+/);
      const allNames = blocks.flatMap((b) =>
        [b.english, b.foreign, b.phonetic, ...(b.aliases || [])]
          .filter(Boolean)
          .map((s) => s.toLowerCase())
      );

      const bestPhrase = closestFromList(phrases, allNames);
      const dist = distance(bestPhrase.phrase, bestPhrase.match);

      if (dist <= 2) {
        bestBlock = blocks.find((b) =>
          [b.english, b.foreign, b.phonetic, ...(b.aliases || [])]
            .filter(Boolean)
            .some((f) => f?.toLowerCase() === bestPhrase.match)
        );
      }
    }

    if (bestBlock) {
      console.log('🔎 Matched:', bestBlock.id, bestBlock.english);
      navigation.navigate('FindWordRecord', { word: bestBlock });
    } else {
      setErrorMessage('❌ No match found for: ' + rawText);
    }
  };

  const closestFromList = (phrases, targets) => {
    let best = { phrase: '', match: '', dist: Infinity };
    for (const phrase of phrases) {
      const match = closest(phrase, targets);
      const dist = distance(phrase, match);
      if (dist < best.dist) best = { phrase, match, dist };
    }
    return best;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="black" />
      <View style={styles.content}>
        {!isListening && !isStarting && (
          <TouchableOpacity style={styles.speakButton} onPress={startListening}>
            <FontAwesome name="microphone" size={28} color="black" />
          </TouchableOpacity>
        )}
        <Text style={styles.speakLabel}>Tap to Speak</Text>
        {isListening && <Text style={styles.listening}>🎤 Listening...</Text>}
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speakButton: {
    backgroundColor: '#FFD700',
    borderRadius: 50,
    padding: 20,
  },
  speakLabel: {
    color: 'white',
    marginTop: 10,
    fontSize: 18,
  },
  listening: {
    marginTop: 10,
    fontSize: 16,
    color: '#00BFFF',
  },
  error: {
    marginTop: 10,
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
