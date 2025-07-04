import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { imageMap } from '../components/imageMap';
import WordInteractionBlock from '../components/WordInteractionBlock';
import WordRecordLayout from '../components/WordRecordLayout';
import useForeignAudio from '../hooks/useForeignAudio';

export default function FindWordRecord({ route }) {
  const navigation = useNavigation();
  const word = route.params?.word;
  const [showEnglish, setShowEnglish] = useState(false);
  const [showTip, setShowTip] = useState(false);

  const imageAsset = word ? imageMap[word.image] : null;
  const { playAudio, isLoaded } = useForeignAudio(word);

  useEffect(() => {
    if (word && isLoaded) playAudio();
  }, [word, isLoaded]);

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

      <View style={styles.topBlock}>
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
