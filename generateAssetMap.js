// generateAssetMap.js
const fs = require('fs');
const path = require('path');

// Console helpers
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;
const green = (text) => `\x1b[32m${text}\x1b[0m`;

// Paths
const blocksPath = './data/blocks.json';
const imageDir = './assets/image';
const audioJapanDir = './assets/audio/japan';
const audioEnglishDir = './assets/audio/english';
const audioFrenchDir = './assets/audio/french';
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
const imageFiles = fs.readdirSync(imageDir);
const audioJapanFiles = fs.readdirSync(audioJapanDir);
const audioEnglishFiles = fs.readdirSync(audioEnglishDir);
const audioFrenchFiles = fs.readdirSync(audioFrenchDir);

const availableImages = new Set(imageFiles);
const availableJapanese = new Set(audioJapanFiles);
const availableEnglish = new Set(audioEnglishFiles);
const availableFrench = new Set(audioFrenchFiles);

// Init maps
let imageMap = 'export const imageMap = {\n';
let audioMap = 'export const audioMap = {\n';
let validImageCount = 0;
let validAudioCount = 0;

fs.writeFileSync(skippedFile, ''); // Reset skipped log

blocks.forEach((block) => {
  const { id, image, audio, audioEnglish, audioFrench } = block;

  // Handle image
  if (image && availableImages.has(image)) {
    imageMap += `  "${image}": require('../assets/image/${image}'),\n`;
    validImageCount++;
  } else {
    const msg = `⚠️ Skipped image for ID ${id}: missing or invalid (${image})`;
    console.warn(yellow(msg));
    fs.appendFileSync(skippedFile, msg + '\n');
  }

  // Handle Japanese audio
  if (audio && availableJapanese.has(audio)) {
    audioMap += `  "${audio}": require('../assets/audio/japan/${audio}'),\n`;
    validAudioCount++;
  } else {
    const msg = `⚠️ Skipped Japanese audio for ID ${id}: missing or invalid (${audio})`;
    console.warn(yellow(msg));
    fs.appendFileSync(skippedFile, msg + '\n');
  }

  // Handle English audio
  if (audioEnglish && availableEnglish.has(audioEnglish)) {
    audioMap += `  "${audioEnglish}": require('../assets/audio/english/${audioEnglish}'),\n`;
    validAudioCount++;
  } else if (audioEnglish) {
    const msg = `⚠️ Skipped English audio for ID ${id}: missing or invalid (${audioEnglish})`;
    console.warn(yellow(msg));
    fs.appendFileSync(skippedFile, msg + '\n');
  }

  // Handle French audio
  if (audioFrench && availableFrench.has(audioFrench)) {
    audioMap += `  "${audioFrench}": require('../assets/audio/french/${audioFrench}'),\n`;
    validAudioCount++;
  } else if (audioFrench) {
    const msg = `⚠️ Skipped French audio for ID ${id}: missing or invalid (${audioFrench})`;
    console.warn(yellow(msg));
    fs.appendFileSync(skippedFile, msg + '\n');
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
