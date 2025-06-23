// utils/progressStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const FILE_PATH = FileSystem.documentDirectory + 'wordProgress.json';

// Default fallback structure
const defaultProgress = {};

export async function loadProgress() {
  try {
    const fileInfo = await FileSystem.getInfoAsync(FILE_PATH);

    if (fileInfo.exists) {
      const content = await FileSystem.readAsStringAsync(FILE_PATH);
      return JSON.parse(content);
    } else {
      // Attempt fallback to legacy AsyncStorage
      const legacy = await AsyncStorage.getItem('wordProgress');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        await saveProgress(parsed);
        console.log('🔄 Migrated progress from AsyncStorage to file');
        return parsed;
      }
    }
  } catch (err) {
    console.error('⚠️ Failed to load progress:', err);
  }
  return defaultProgress;
}

export async function saveProgress(progress) {
  try {
    await FileSystem.writeAsStringAsync(FILE_PATH, JSON.stringify(progress));
  } catch (err) {
    console.error('❌ Failed to save progress:', err);
  }
}

export async function updateWordStage(id, newStage) {
  const current = await loadProgress();
  current[id] = { stage: newStage };
  await saveProgress(current);
}

export function getStage(progress, id) {
  return progress[id]?.stage ?? 0;
}

export async function resetProgress() {
  try {
    await FileSystem.deleteAsync(FILE_PATH, { idempotent: true });
    console.log('🧹 Progress reset');
  } catch (err) {
    console.error('⚠️ Failed to reset progress:', err);
  }
}
