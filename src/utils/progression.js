import { LEVELS, MAX_LEVEL } from './constants';

export function getLevelFromXp(xp) {
  let current = LEVELS[0];
  for (const tier of LEVELS) {
    if (xp >= tier.xpRequired) current = tier;
  }
  return current;
}

export function xpProgress(xp, level) {
  const current = LEVELS.find((l) => l.level === level) ?? LEVELS[0];
  const next = LEVELS.find((l) => l.level === level + 1);
  if (!next || level >= MAX_LEVEL) return 1;
  const span = next.xpRequired - current.xpRequired;
  return clamp01((xp - current.xpRequired) / span);
}

function clamp01(n) {
  return Math.min(1, Math.max(0, n));
}

export function pickIdleBehavior(hunger, energy) {
  if (hunger < 30) return 'sad';
  if (energy < 20) return 'lieDown';
  const roll = Math.random();
  if (roll < 0.22) return 'lookAround';
  if (roll < 0.38) return 'sit';
  if (roll < 0.5) return 'stretch';
  if (roll < 0.6) return 'bark';
  return 'idle';
}
