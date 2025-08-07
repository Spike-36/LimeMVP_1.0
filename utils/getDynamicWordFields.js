export function getDynamicWordFields(word, targetLang) {
  if (!word || !targetLang) return {};

  let foreignText = '';
  let phoneticText = '';
  let audioKey = '';
  let slowAudioKey = '';
  let femaleAudioKey = '';

  if (targetLang === 'japanese') {
    foreignText = word.foreign || '';
    phoneticText = word.phonetic || '';
    audioKey = 'audio';
    slowAudioKey = 'audioJapaneseSlow';
    femaleAudioKey = 'audioJapaneseFemale';
  } else if (targetLang === 'korean') {
    foreignText = word.korean || '';
    phoneticText = word.koreanPhonetic || '';
    audioKey = 'audioKorean';
    slowAudioKey = 'audioKoreanSlow';
    femaleAudioKey = 'audioKoreanFemale';
  } else {
    // fallback for unsupported languages
    console.warn(`Unsupported language: ${targetLang}`);
  }

  return {
    foreignText,
    phoneticText,
    audioKey,
    slowAudioKey,
    femaleAudioKey,
  };
}
