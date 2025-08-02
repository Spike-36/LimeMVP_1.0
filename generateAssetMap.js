const fs = require('fs');
const path = require('path');

// Console helpers
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;
const green = (text) => `\x1b[32m${text}\x1b[0m`;

// Paths
const blocksPath = './data/blocks.json';
const imageDir = './assets/image';
const audioDirs = {
  japan: './assets/audio/japan',
  japanSlow: './assets/audio/japanSlow',
  japanFemale: './assets/audio/japanFemale',
  korean: './assets/audio/korean',
  koreanSlow: './assets/audio/koreanSlow',
  koreanFemale: './assets/audio/koreanFemale',
  english: './assets/audio/english',
  french: './assets/audio/french',
  spanish: './assets/audio/spanish',
};

const imageMapOutput = './components/imageMap.js';
const audioMapOutput = './components/audioMap.js';
const skippedFile = './skippedAssets.txt';

// Load block records
let blocks;
try {
  blocks = JSON.parse(fs.readFileSync(blocksPath, 'utf8'));
} catch (err) {
  console.error(`❌ Failed to read ${blocksPath}`);
  process.exit(1);
}

// Read available asset files
const available = {};
for (const [key, dir] of Object.entries(audioDirs)) {
  available[key] = new Set(fs.readdirSync(dir));
}
const availableImages = new Set(fs.readdirSync(imageDir));

// Init maps
let imageMap = 'export const imageMap = {\n';
let audioMap = 'export const audioMap = {\n';
let validImageCount = 0;
let validAudioCount = 0;

fs.writeFileSync(skippedFile, ''); // Reset skipped log

blocks.forEach((block) => {
  const {
    id,
    image,
    audio,
    audioJapaneseSlow,
    audioJapaneseFemale,
    audioKorean,
    audioKoreanSlow,
    audioKoreanFemale,
    audioEnglish,
    audioFrench,
    audioSpanish,
  } = block;

  // Image
  if (image && availableImages.has(image)) {
    imageMap += `  "${image}": require('../assets/image/${image}'),\n`;
    validImageCount++;
  } else {
    const msg = `⚠️ Skipped image for ID ${id}: missing or invalid (${image})`;
    console.warn(yellow(msg));
    fs.appendFileSync(skippedFile, msg + '\n');
  }

  // Audio variants
  const audioVariants = [
    { key: audio, dir: 'japan' },
    { key: audioJapaneseSlow, dir: 'japanSlow' },
    { key: audioJapaneseFemale, dir: 'japanFemale' },
    { key: audioKorean, dir: 'korean' },
    { key: audioKoreanSlow, dir: 'koreanSlow' },
    { key: audioKoreanFemale, dir: 'koreanFemale' },
    { key: audioEnglish, dir: 'english' },
    { key: audioFrench, dir: 'french' },
    { key: audioSpanish, dir: 'spanish' },
  ];

  for (const { key, dir } of audioVariants) {
    if (key) {
      if (available[dir]?.has(key)) {
        audioMap += `  "${key}": require('../assets/audio/${dir}/${key}'),\n`;
        validAudioCount++;
      } else {
        const msg = `⚠️ Skipped ${dir} audio for ID ${id}: missing or invalid (${key})`;
        console.warn(yellow(msg));
        fs.appendFileSync(skippedFile, msg + '\n');
      }
    }
  }
});

imageMap += '};\n';
audioMap += '};\n';

// Write output files
fs.writeFileSync(imageMapOutput, imageMap);
fs.writeFileSync(audioMapOutput, audioMap);

// Summary
console.log(green(`\n✅ audioMap.js generated with ${validAudioCount} entries`));
console.log(green(`✅ imageMap.js generated with ${validImageCount} entries`));
console.log(green(`⏺ Skipped log written to ${skippedFile}`));
