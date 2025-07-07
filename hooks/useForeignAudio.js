import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { audioMap } from '../components/audioMap';

export default function useForeignAudio(word) {
  const soundRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load audio when word changes
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!word?.audio || !audioMap[word.audio]) {
        console.warn('⚠️ No audio found for:', word?.audio);
        return;
      }

      try {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current.setOnPlaybackStatusUpdate(null);
          soundRef.current = null;
        }

        const { sound } = await Audio.Sound.createAsync(audioMap[word.audio]);
        if (isMounted) {
          soundRef.current = sound;
          setIsLoaded(true);
        }
      } catch (err) {
        console.warn('❌ Audio load error:', err.message);
      }
    };

    setIsLoaded(false);
    load();

    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [word?.audio]);

  const playAudio = async () => {
    if (!soundRef.current || !isLoaded) {
      console.warn('⚠️ Tried to play before sound was loaded');
      return;
    }

    try {
      await soundRef.current.replayAsync();
    } catch (err) {
      console.warn('❌ Audio playback error:', err.message);
    }
  };

  return { playAudio, isLoaded };
}
