// utils/getDynamicWordFields.js

export function getDynamicWordFields(word, targetLang) {
  if (!word || !targetLang) return {};

  const capitalized = targetLang.charAt(0).toUpperCase() + targetLang.slice(1);

  return {
    foreignText: word?.[targetLang] || word?.foreign || '',
    phoneticText: word?.[`${targetLang}Phonetic`] || word?.phonetic || '',
    audioKey: capitalized === 'Japanese' ? 'audio' : `audio${capitalized}`,
    slowAudioKey: `audio${capitalized}Slow`,
    femaleAudioKey: `audio${capitalized}Female`,
  };
}
