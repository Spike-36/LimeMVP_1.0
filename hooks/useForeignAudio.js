// hooks/useForeignAudio.js
import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { audioMap } from '../components/audioMap';

export default function useForeignAudio(word) {
  const soundRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const isLoadingRef = useRef(false); // ⛔ prevent overlapping loads

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!word?.audio) {
        console.warn('⚠️ No audio specified for word:', word);
        return;
      }

      const source = audioMap[word.audio];
      if (!source) {
        console.warn('⚠️ Audio missing from audioMap:', word.audio);
        return;
      }

      try {
        isLoadingRef.current = true;
        setIsLoaded(false);

        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current.setOnPlaybackStatusUpdate(null);
          soundRef.current = null;
        }

        const { sound } = await Audio.Sound.createAsync(source);
        if (isMounted) {
          soundRef.current = sound;
          setIsLoaded(true);
        }
      } catch (err) {
        console.warn('❌ Audio load error:', err.message);
      } finally {
        isLoadingRef.current = false;
      }
    };

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
    if (isLoadingRef.current) {
      console.warn('⚠️ Audio is still loading, playback skipped.');
      return;
    }

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
