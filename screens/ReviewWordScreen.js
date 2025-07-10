import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { audioMap } from '../components/audioMap';
import { imageMap } from '../components/imageMap';
import WordInteractionBlock from '../components/WordInteractionBlock';
import WordRecordLayout from '../components/WordRecordLayout';
import { getStage, loadProgress } from '../utils/progressStorage';

export default function ReviewWordScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { words = [], index = 0 } = route.params || {};

  const [currentIndex, setCurrentIndex] = useState(index);
  const [progress, setProgress] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);
  const [autoplay, setAutoplay] = useState(false);

  const current = words[currentIndex];
  const currentStage = getStage(progress, current?.id);
  const soundRef = useRef(null);
  const autoplayTimer = useRef(null);

  const REPLAY_DELAY = 2000;

  useFocusEffect(
    useCallback(() => {
      loadProgress().then(setProgress);
    }, [])
  );

  useEffect(() => {
    setShowAnswer(false);
    setShowEnglish(false);
  }, [currentIndex]);

  useEffect(() => {
    if (!current?.audio || !audioMap[current.audio]) return;
    let isMounted = true;

    const loadAndPlayTwice = async () => {
      try {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current.setOnPlaybackStatusUpdate(null);
          soundRef.current = null;
        }

        const { sound } = await Audio.Sound.createAsync(audioMap[current.audio]);
        soundRef.current = sound;

        await sound.playAsync();

        sound.setOnPlaybackStatusUpdate(status => {
          if (status.didJustFinish && isMounted) {
            setTimeout(() => {
              if (isMounted) {
                sound.replayAsync().catch(err =>
                  console.warn('❌ Error during delayed replay in ReviewWordScreen:', err.message)
                );
              }
            }, REPLAY_DELAY);
            sound.setOnPlaybackStatusUpdate(null);
          }
        });
      } catch (err) {
        console.warn('❌ Audio error in ReviewWordScreen:', err.message);
      }
    };

    loadAndPlayTwice();

    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [current?.audio]);

  useEffect(() => {
    if (!autoplay || !current) return;

    const delayReveal = 2000;
    const delayNext = 4000;

    setShowAnswer(false);

    autoplayTimer.current = setTimeout(() => {
      setShowAnswer(true);

      autoplayTimer.current = setTimeout(() => {
        handleNext();
      }, delayNext);
    }, delayReveal);

    return () => clearTimeout(autoplayTimer.current);
  }, [currentIndex, autoplay]);

  const playAudio = async () => {
    if (!soundRef.current) return;
    try {
      await soundRef.current.replayAsync();
      setTimeout(() => {
        soundRef.current?.replayAsync().catch(err =>
          console.warn('❌ Manual double replay error:', err.message)
        );
      }, REPLAY_DELAY);
    } catch (err) {
      console.warn('❌ Manual replay error:', err.message);
    }
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % words.length;
    setCurrentIndex(nextIndex);
  };

  const toggleAutoplay = () => {
    setAutoplay(prev => !prev);
  };

  if (!current) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.emptyText}>No words available to review.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topHalf}>
        <WordRecordLayout
          block={current}
          imageAsset={imageMap[current.image]}
          showImage={showAnswer}
          showTipIcon={showAnswer}
          showInfoIcon={showAnswer}
          showEnglish={showEnglish}
          hideAudioButton={true}
          onPlayAudio={playAudio}
          onToggleEnglish={() => setShowEnglish(!showEnglish)}
          onPressFind={() => navigation.navigate('Find', { screen: 'VoiceSearch' })}
        />

        <TouchableOpacity onPress={toggleAutoplay} style={styles.autoPlayIconWrapper}>
          <MaterialCommunityIcons
            name="autorenew"
            size={28}
            color={autoplay ? 'limegreen' : '#aaa'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomHalf}>
        <WordInteractionBlock
          block={current}
          stage={currentStage}
          onStageChange={() => {}}
          onPlayAudio={playAudio}
          showStars={false}
          showInstruction={!showAnswer}
          showPhonetic={showAnswer}
        />

        {!autoplay && (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={showAnswer ? handleNext : () => setShowAnswer(true)}
          >
            <Text style={styles.buttonText}>{showAnswer ? 'Next' : 'Show Answer'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  topHalf: { height: '58%', position: 'relative' },
  bottomHalf: {
    height: '42%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,
  },
  nextButton: {
    backgroundColor: '#444',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: { color: 'white', fontSize: 18 },
  autoPlayIconWrapper: {
    position: 'absolute',
    top: 75,
    left: 20,
    zIndex: 5,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 8,
    borderRadius: 20,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  emptyText: {
    fontSize: 20,
    color: 'gray',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
