import AsyncStorage from '@react-native-async-storage/async-storage';

const PROGRESS_KEY = 'wordProgress';

export async function loadProgress() {
  try {
    const json = await AsyncStorage.getItem(PROGRESS_KEY);
    return json ? JSON.parse(json) : {};
  } catch (err) {
    console.error('❌ Failed to load progress:', err);
    return {};
  }
}

export async function saveProgress(updatedProgress) {
  try {
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(updatedProgress));
  } catch (err) {
    console.error('❌ Failed to save progress:', err);
  }
}

// ✅ Unified progress update
export async function updateWordStage(wordId, stage) {
  const current = await loadProgress();
  const newProgress = { ...current, [wordId]: { stage } };
  await saveProgress(newProgress);
}

// ✅ Unified progress read helper
export function getStage(progress, wordId) {
  return progress[wordId]?.stage ?? 0;
}

// ✅ One-time migration from legacy listen/speak system
export async function migrateLegacyProgress() {
  const current = await loadProgress();
  let migrated = {};

  for (const [wordId, value] of Object.entries(current)) {
    if (value.stage !== undefined) {
      migrated[wordId] = { stage: value.stage }; // already migrated
      continue;
    }
    const maxStage = Math.max(value.listen || 0, value.speak || 0);
    migrated[wordId] = { stage: maxStage };
  }

  await saveProgress(migrated);
  console.log('✅ Migrated legacy progress to unified system');
}
