import { create } from 'zustand';
import { FOODS, LEVELS } from '../utils/constants';
import { clamp } from '../utils/math';
import { getLevelFromXp } from '../utils/progression';

let foodId = 0;

export const usePetStore = create((set, get) => ({
  hunger: 100,
  happiness: 100,
  energy: 100,
  level: 1,
  xp: 0,
  levelName: 'Puppy',
  isPlaced: false,
  petPosition: [0, 0, -1.4],
  petRotationY: Math.PI,
  animation: 'idle',
  lockedAnimation: false,
  targetPosition: null,
  moveGait: 'walk',
  selectedFoodId: 'bone',
  heldFood: null,
  placedFoods: [],
  gesture: 'none',
  voiceFeedback: '',
  lastCommand: '',
  arSupported: false,
  arActive: false,
  worldCameraReady: false,
  hitPose: null,
  trackingLost: false,
  showLevelUp: false,
  isListening: false,
  handsReady: false,
  overlayRoot: null,
  lastPetSound: 0,

  setOverlayRoot: (el) => set({ overlayRoot: el }),
  setArSupported: (arSupported) => set({ arSupported }),
  setArActive: (arActive) => set({ arActive }),
  enterAr: () =>
    set({
      arActive: true,
      isPlaced: false,
      trackingLost: false,
      targetPosition: null,
      heldFood: null,
      placedFoods: [],
    }),
  setWorldCameraReady: (worldCameraReady) => set({ worldCameraReady }),
  setHitPose: (hitPose) => set({ hitPose }),
  setTrackingLost: (trackingLost) => set({ trackingLost }),
  setHandsReady: (handsReady) => set({ handsReady }),
  setListening: (isListening) => set({ isListening }),
  setGesture: (gesture) => set({ gesture }),
  setVoiceFeedback: (voiceFeedback) => set({ voiceFeedback }),

  placePet: (position) =>
    set({
      isPlaced: true,
      petPosition: position,
      animation: 'idle',
      targetPosition: null,
    }),

  setPetPose: (petPosition, petRotationY) =>
    set((state) => ({
      petPosition,
      petRotationY: petRotationY ?? state.petRotationY,
    })),

  setAnimation: (animation, { lock = false, duration = 0 } = {}) => {
    set({ animation, lockedAnimation: lock });
    if (lock && duration > 0) {
      window.setTimeout(() => {
        const state = get();
        if (state.animation === animation) {
          set({ lockedAnimation: false, animation: 'idle' });
        }
      }, duration);
    }
  },

  moveTo: (target, gait = 'walk') =>
    set({
      targetPosition: target,
      moveGait: gait,
      animation: gait,
      lockedAnimation: false,
    }),

  stopMoving: () =>
    set({
      targetPosition: null,
      animation: 'idle',
      lockedAnimation: false,
    }),

  selectFood: (id) => set({ selectedFoodId: id }),

  spawnHeldFood: () => {
    const { selectedFoodId } = get();
    const def = FOODS.find((f) => f.id === selectedFoodId);
    if (!def) return;
    set({
      heldFood: {
        instanceId: ++foodId,
        foodId: def.id,
        name: def.name,
      },
    });
  },

  placeHeldFood: (position) => {
    const { heldFood } = get();
    if (!heldFood) return;
    const placed = { ...heldFood, position };
    set((state) => ({
      heldFood: null,
      placedFoods: [...state.placedFoods, placed],
      targetPosition: position,
      moveGait: 'walk',
      animation: 'walk',
      lockedAnimation: false,
    }));
  },

  consumeFood: (instanceId) => {
    const food = get().placedFoods.find((f) => f.instanceId === instanceId);
    if (!food) return;
    const def = FOODS.find((f) => f.id === food.foodId);
    set((state) => ({
      placedFoods: state.placedFoods.filter((f) => f.instanceId !== instanceId),
    }));
    if (def) {
      get().applyCare(def.hunger, def.happiness, def.xp);
    }
    get().setAnimation('eat', { lock: true, duration: 2200 });
  },

  petTapped: () => {
    const now = performance.now();
    const bark = now - get().lastPetSound > 4000 && Math.random() < 0.45;
    set({ lastPetSound: bark ? now : get().lastPetSound });
    get().applyCare(0, 8, 4);
    get().setAnimation('tailWag', { lock: true, duration: 1600 });
    return { bark, hearts: true };
  },

  applyCare: (hungerDelta, happinessDelta, xpDelta) => {
    const prev = get();
    const hunger = clamp(prev.hunger + hungerDelta);
    const happiness = clamp(prev.happiness + happinessDelta);
    const energy = clamp(prev.energy + (hungerDelta > 0 ? 4 : 0));
    const xp = prev.xp + xpDelta;
    const tier = getLevelFromXp(xp);
    const leveledUp = tier.level > prev.level;
    set({
      hunger,
      happiness,
      energy,
      xp,
      level: tier.level,
      levelName: tier.name,
      showLevelUp: leveledUp || prev.showLevelUp,
    });
    return leveledUp;
  },

  tickNeeds: (dt) => {
    const s = get();
    if (!s.isPlaced) return;
    const moving = Boolean(s.targetPosition);
    const hunger = clamp(s.hunger - dt * 0.32);
    const happiness = clamp(s.happiness - dt * 0.16);
    let energy = s.energy;
    if (moving) energy = clamp(energy - dt * (s.moveGait === 'run' ? 3.2 : 1.8));
    else if (s.animation === 'idle' || s.animation === 'sit' || s.animation === 'lieDown') {
      energy = clamp(energy + dt * 1.1);
    }
    set({ hunger, happiness, energy });
  },

  dismissLevelUp: () => set({ showLevelUp: false }),

  applyVoiceCommand: (commandId, cameraPos) => {
    const map = {
      bark: () => get().setAnimation('bark', { lock: true, duration: 1200 }),
      sit: () => {
        get().stopMoving();
        get().setAnimation('sit', { lock: true, duration: 2800 });
      },
      jump: () => get().setAnimation('jump', { lock: true, duration: 1100 }),
      dance: () => get().setAnimation('dance', { lock: true, duration: 3200 }),
      come: () => {
        if (!cameraPos) return;
        get().moveTo([cameraPos[0], 0, cameraPos[2]], 'walk');
      },
      run: () => {
        const [x, , z] = get().petPosition;
        get().moveTo([x + (Math.random() - 0.5) * 1.6, 0, z - 1.2], 'run');
      },
      stop: () => get().stopMoving(),
      eat: () => get().spawnHeldFood(),
    };
    map[commandId]?.();
    const label = commandId === 'come' ? 'Come here' : commandId;
    set({ lastCommand: label, voiceFeedback: `Heard: ${label}` });
  },

  applyGesture: (label, cameraPos) => {
    const prev = get().gesture;
    if (prev === label) return;
    set({ gesture: label });
    switch (label) {
      case 'Open Palm':
        if (cameraPos) get().moveTo([cameraPos[0], 0, cameraPos[2]], 'walk');
        break;
      case 'Point Left': {
        const [x, y, z] = get().petPosition;
        get().moveTo([x - 0.9, y, z], 'walk');
        break;
      }
      case 'Point Right': {
        const [x, y, z] = get().petPosition;
        get().moveTo([x + 0.9, y, z], 'walk');
        break;
      }
      case 'Thumbs Up':
        get().setAnimation('jump', { lock: true, duration: 1100 });
        break;
      case 'Raised Hand':
        get().stopMoving();
        get().setAnimation('sit', { lock: true, duration: 2800 });
        break;
      case 'Closed Fist':
        get().stopMoving();
        break;
      default:
        break;
    }
  },
}));

export const initialPetSnapshot = {
  hunger: 100,
  happiness: 100,
  energy: 100,
  level: 1,
  xp: 0,
};

void LEVELS;
