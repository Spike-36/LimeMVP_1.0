import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { audioMap } from '../components/audioMap';

export default function useForeignAudio(word) {
  const [isLoaded, setIsLoaded] = useState(false);
  const soundRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const loadSound = async () => {
      const asset = word?.audio && audioMap[word.audio];
      if (!asset) return;

      try {
        const { sound } = await Audio.Sound.createAsync(
          asset,
          { volume: 1.0 } // 👈 ensures full volume on load
        );
        if (!isMounted) return;

        soundRef.current = sound;
        setIsLoaded(true);
      } catch (err) {
        console.warn('❌ Audio preload error:', err);
      }
    };

    loadSound();

    return () => {
      isMounted = false;
      setIsLoaded(false);
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
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
      await soundRef.current.setStatusAsync({ volume: 1.0 }); // 👈 reinforce volume at play time
      await soundRef.current.replayAsync();
    } catch (err) {
      console.warn('❌ Audio playback failed:', err);
    }
  };

  return { playAudio, isLoaded };
}
