export const APP_NAME = 'AR Pet Companion';

export const STAT_DECAY = {
  hungerPerSecond: 0.35,
  happinessPerSecond: 0.18,
  energyRecoverIdle: 1.2,
  energyDrainMove: 2.4,
};

export const FOODS = [
  {
    id: 'bone',
    name: 'Bone',
    emoji: '🦴',
    hunger: 18,
    happiness: 8,
    xp: 12,
    color: '#f5f0e6',
  },
  {
    id: 'chicken',
    name: 'Chicken',
    emoji: '🍗',
    hunger: 25,
    happiness: 12,
    xp: 18,
    color: '#e8a87c',
  },
  {
    id: 'biscuit',
    name: 'Biscuit',
    emoji: '🍪',
    hunger: 12,
    happiness: 15,
    xp: 10,
    color: '#c4a35a',
  },
];

export const LEVELS = [
  { level: 1, name: 'Puppy', xpRequired: 0 },
  { level: 2, name: 'Companion', xpRequired: 100 },
  { level: 3, name: 'Smart Dog', xpRequired: 250 },
  { level: 4, name: 'Guardian', xpRequired: 450 },
];

export const MAX_LEVEL = LEVELS.length;

export const ANIMATIONS = {
  idle: 'idle',
  walk: 'walk',
  run: 'run',
  sit: 'sit',
  jump: 'jump',
  bark: 'bark',
  eat: 'eat',
  tailWag: 'tailWag',
  lieDown: 'lieDown',
  dance: 'dance',
  lookAround: 'lookAround',
  stretch: 'stretch',
  sad: 'sad',
};

export const GESTURES = {
  none: 'none',
  openPalm: 'Open Palm',
  pointLeft: 'Point Left',
  pointRight: 'Point Right',
  thumbsUp: 'Thumbs Up',
  raisedHand: 'Raised Hand',
  closedFist: 'Closed Fist',
};

export const VOICE_COMMANDS = [
  { id: 'bark', phrases: ['bark', 'speak', 'woof'] },
  { id: 'sit', phrases: ['sit', 'sit down'] },
  { id: 'jump', phrases: ['jump', 'hop'] },
  { id: 'dance', phrases: ['dance', 'boogie'] },
  { id: 'come', phrases: ['come here', 'come', 'here boy', 'come to me'] },
  { id: 'run', phrases: ['run', 'run around'] },
  { id: 'stop', phrases: ['stop', 'stay', 'wait'] },
  { id: 'eat', phrases: ['eat', 'hungry', 'dinner'] },
];

export const MODEL_PATHS = {
  dog: '/models/dog.glb',
  bone: '/models/bone.glb',
  chicken: '/models/chicken.glb',
  biscuit: '/models/biscuit.glb',
};

export const DOG_SCALE = 1;
export const WALK_SPEED = 0.85;
export const RUN_SPEED = 1.7;
export const TAP_DISTANCE = 0.55;
