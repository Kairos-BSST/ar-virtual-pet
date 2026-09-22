import { useEffect } from 'react';
import { usePetStore } from '../store/petStore';
import { pickIdleBehavior } from '../utils/progression';

export function usePetNeeds() {
  useEffect(() => {
    let last = performance.now();
    let idleTimer = 6 + Math.random() * 5;
    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      const store = usePetStore.getState();
      store.tickNeeds(dt);
      if (!store.isPlaced || store.targetPosition || store.lockedAnimation) return;
      idleTimer -= dt;
      if (idleTimer <= 0) {
        const next = pickIdleBehavior(store.hunger, store.energy);
        store.setAnimation(next, {
          lock: next !== 'idle' && next !== 'sad' && next !== 'lieDown',
          duration: 2200,
        });
        idleTimer = 7 + Math.random() * 6;
      }
    }, 250);
    return () => window.clearInterval(id);
  }, []);
}
