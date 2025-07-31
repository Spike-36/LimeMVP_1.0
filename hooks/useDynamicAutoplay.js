import { Audio } from 'expo-av';
import { useEffect, useRef } from 'react';
import { audioMap } from '../components/audioMap';

export default function useDynamicAutoplay({ active, block, onReveal, onAdvance }) {
  const isCancelled = useRef(false);
  const prevId = useRef(null);

  useEffect(() => {
    if (!active || !block?.id) return;

    if (prevId.current === block.id) return;
    prevId.current = block.id;
    isCancelled.current = false;

    const playAudio = async (key) => {
      if (!block[key] || !audioMap[block[key]]) return;
      try {
        const { sound } = await Audio.Sound.createAsync(audioMap[block[key]]);
        await sound.playAsync();
        await new Promise((resolve) => {
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
              sound.unloadAsync().catch(() => {});
              resolve();
            }
          });
        });
      } catch (err) {
        console.warn(`🔇 Failed to play ${key}:`, err.message);
      }
    };

    const runSequence = async () => {
      try {
        await playAudio('audioJapaneseFemale');  // ⬅️ Replaced 'audio' with 'audioJapaneseFemale'
        if (isCancelled.current) return;

        await new Promise(r => setTimeout(r, 1000));
        await playAudio('audio');         // Japanese 2
        if (isCancelled.current) return;

        await new Promise(r => setTimeout(r, 2000));
        await playAudio('audioFrench');   // French
        if (isCancelled.current) return;

        await new Promise(r => setTimeout(r, 1000));
        onReveal?.();
        await playAudio('audioEnglish');  // English
        if (isCancelled.current) return;

        await new Promise(r => setTimeout(r, 2000));
        onAdvance?.();                    // Auto-advance
      } catch (err) {
        console.warn('❌ Autoplay sequence error:', err.message);
      }
    };

    runSequence();

    return () => {};
  }, [active, block?.id]);
}
