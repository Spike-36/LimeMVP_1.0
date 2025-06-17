// generateAudioImageMaps.js
const fs = require('fs');
const path = require('path');

// Console helpers
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;
const green = (text) => `\x1b[32m${text}\x1b[0m`;

// Paths
const blocksPath = './data/blocks.json';
const imageDir = './assets/image';
const audioDir = './assets/audio/japan';
const imageMapOutput = './components/ImageMap.js';
const audioMapOutput = './components/AudioMap.js';
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
const audioFiles = fs.readdirSync(audioDir);
const availableImages = new Set(imageFiles);
const availableAudios = new Set(audioFiles);

// Init maps
let imageMap = 'export const imageMap = {\n';
let audioMap = 'export const audioMap = {\n';
let validImageCount = 0;
let validAudioCount = 0;

fs.writeFileSync(skippedFile, ''); // Reset skipped log

blocks.forEach((block) => {
  const { id, image, audio } = block;

  // Validate image
  if (image && availableImages.has(image)) {
    imageMap += `  "${image}": require('../assets/image/${image}'),\n`;
    validImageCount++;
  } else {
    const msg = `⚠️ Skipped image for ID ${id}: missing or invalid (${image})`;
    console.warn(yellow(msg));
    fs.appendFileSync(skippedFile, msg + '\n');
  }

  // Validate audio
  if (audio && availableAudios.has(audio)) {
    audioMap += `  "${audio}": require('../assets/audio/japan/${audio}'),\n`;
    validAudioCount++;
  } else {
    const msg = `⚠️ Skipped audio for ID ${id}: missing or invalid (${audio})`;
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
console.log(green(`\n✅ AudioMap.js generated with ${validAudioCount} entries`));
console.log(green(`✅ ImageMap.js generated with ${validImageCount} entries`));
console.log(green(`⏺ Skipped log written to ${skippedFile}`));
