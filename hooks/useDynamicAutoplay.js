// hooks/useDynamicAutoplay.js
import { Audio } from 'expo-av';
import { useEffect, useRef } from 'react';
import { audioMap } from '../components/audioMap';

export default function useDynamicAutoplay({ active, block, onReveal, onAdvance }) {
  const timeouts = useRef([]);
  const soundRefs = useRef([]);
  const prevId = useRef(null);

  useEffect(() => {
    if (!active || !block || !block.id) return;

    // Prevent duplicate runs on same block
    if (prevId.current === block.id) return;
    prevId.current = block.id;

    const playAudio = async (key) => {
      if (!block[key] || !audioMap[block[key]]) return;
      try {
        const { sound } = await Audio.Sound.createAsync(audioMap[block[key]]);
        soundRefs.current.push(sound);
        await sound.playAsync();
      } catch (err) {
        console.warn(`🔇 Failed to play ${key}:`, err.message);
      }
    };

    // Sequence: JP → JP → FR → Reveal + EN → Advance
    const schedule = () => {
      timeouts.current.push(setTimeout(() => playAudio('audio'), 0));
      timeouts.current.push(setTimeout(() => playAudio('audio'), 2000));
      timeouts.current.push(setTimeout(() => playAudio('audioFrench'), 4000));
      timeouts.current.push(setTimeout(() => {
        playAudio('audioEnglish');
        onReveal?.();
      }, 7000));
      timeouts.current.push(setTimeout(() => {
        onAdvance?.();
      }, 10000));
    };

    schedule();

    return () => {
      timeouts.current.forEach(clearTimeout);
      timeouts.current = [];
      soundRefs.current.forEach(async s => {
        try {
          await s.unloadAsync();
        } catch {}
      });
      soundRefs.current = [];
    };
  }, [active, block?.id]); // only triggers when block changes
}
