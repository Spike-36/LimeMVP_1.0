import blocks from '../data/blocks.json';

export function getEligibleWords(progress, mode) {
  return blocks.filter((block) => {
    const stage = progress[block.id]?.[mode] || 0;
    if (mode === 'listen') return stage >= 1;
    if (mode === 'speak') return stage >= 2;
    return false;
  });
}
