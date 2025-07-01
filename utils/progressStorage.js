import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const FILE_PATH = FileSystem.documentDirectory + 'wordProgress.json';
const defaultProgress = {};

export async function loadProgress() {
  try {
    const fileInfo = await FileSystem.getInfoAsync(FILE_PATH);
    if (fileInfo.exists) {
      const content = await FileSystem.readAsStringAsync(FILE_PATH);
      return JSON.parse(content);
    } else {
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

export async function updateWordStage(id, newStage, force = false) {
  if (newStage < 0 || newStage > 4) return;

  const current = await loadProgress();
  const existingStage = current[id]?.stage ?? 0;

  if (force || newStage > existingStage) {
    console.log(`⬆️ Updating word ${id} from ${existingStage} to ${newStage}${force ? ' (forced)' : ''}`);
    current[id] = { stage: newStage };
    await saveProgress(current);
  } else {
    console.log(`🚫 Skipped update — current: ${existingStage}, attempted: ${newStage}`);
  }
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

export async function getAllStages() {
  const progress = await loadProgress();
  const stages = { 0: [], 1: [], 2: [], 3: [], 4: [] };

  Object.entries(progress).forEach(([id, data]) => {
    const stage = data.stage ?? 0;
    if (stage >= 0 && stage <= 4) {
      stages[stage].push(id);
    }
  });

  return stages;
}
