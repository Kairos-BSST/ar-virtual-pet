import { ANIMATIONS } from '../utils/constants';

const CLIP_LENGTHS = {
  [ANIMATIONS.idle]: Infinity,
  [ANIMATIONS.walk]: Infinity,
  [ANIMATIONS.run]: Infinity,
  [ANIMATIONS.sit]: 2.6,
  [ANIMATIONS.jump]: 1.0,
  [ANIMATIONS.bark]: 1.1,
  [ANIMATIONS.eat]: 2.1,
  [ANIMATIONS.tailWag]: 1.5,
  [ANIMATIONS.lieDown]: Infinity,
  [ANIMATIONS.dance]: 3.0,
  [ANIMATIONS.lookAround]: 2.2,
  [ANIMATIONS.stretch]: 2.0,
  [ANIMATIONS.sad]: Infinity,
};

export function resolveClip(animation, { hunger, happiness, energy, moving }) {
  if (moving) return animation === 'run' ? 'run' : 'walk';
  if (energy < 20 && !CLIP_LENGTHS[animation]) return 'lieDown';
  if (hunger < 30 && animation === 'idle') return 'sad';
  if (happiness > 80 && animation === 'idle') return 'tailWag';
  return animation || 'idle';
}

export function clipDuration(name) {
  return CLIP_LENGTHS[name] ?? 1.2;
}

export function wagFrequency(happiness) {
  return happiness > 80 ? 11 : 6;
}
