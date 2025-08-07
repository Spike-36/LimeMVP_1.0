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

// Load available files
const availableAssets = {};
Object.entries(audioDirs).forEach(([key, dir]) => {
  availableAssets[key] = new Set(fs.readdirSync(dir));
});
const availableImages = new Set(fs.readdirSync(imageDir));

// Init maps
let imageMap = 'export const imageMap = {\n';
let audioMap = 'export const audioMap = {\n';
let validImageCount = 0;
let validAudioCount = 0;
fs.writeFileSync(skippedFile, ''); // Clear skipped log

// Helper: Add audio entry
const addAudio = (id, filename, type, folder) => {
  if (!filename) return;
  const fileSet = availableAssets[type];
  if (fileSet && fileSet.has(filename)) {
    audioMap += `  "${filename}": require('../assets/audio/${folder}/${filename}'),\n`;
    validAudioCount++;
  } else {
    const msg = `⚠️ Skipped ${type} audio for ID ${id}: missing or invalid (${filename})`;
    console.warn(yellow(msg));
    fs.appendFileSync(skippedFile, msg + '\n');
  }
};

// Main loop
blocks.forEach((block) => {
  const {
    id,
    image,
    audio, // japan
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

  // Audio
  addAudio(id, audio, 'japan', 'japan');
  addAudio(id, audioJapaneseSlow, 'japanSlow', 'japanSlow');
  addAudio(id, audioJapaneseFemale, 'japanFemale', 'japanFemale');
  addAudio(id, audioKorean, 'korean', 'korean');
  addAudio(id, audioKoreanSlow, 'koreanSlow', 'koreanSlow');
  addAudio(id, audioKoreanFemale, 'koreanFemale', 'koreanFemale');
  addAudio(id, audioEnglish, 'english', 'english');
  addAudio(id, audioFrench, 'french', 'french');
  addAudio(id, audioSpanish, 'spanish', 'spanish');
});

// Finalize and write output
imageMap += '};\n';
audioMap += '};\n';

fs.writeFileSync(imageMapOutput, imageMap);
fs.writeFileSync(audioMapOutput, audioMap);

console.log(green(`\n✅ audioMap.js generated with ${validAudioCount} entries`));
console.log(green(`✅ imageMap.js generated with ${validImageCount} entries`));
console.log(green(`⏺ Skipped log written to ${skippedFile}`));
