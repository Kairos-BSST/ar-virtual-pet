import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MODEL_PATHS } from '../utils/constants';

const cache = new Map();
const loader = new GLTFLoader();

function loadGltf(url) {
  if (cache.has(url)) return cache.get(url);
  const promise = new Promise((resolve) => {
    loader.load(
      url,
      (gltf) => resolve(gltf),
      undefined,
      () => resolve(null),
    );
  });
  cache.set(url, promise);
  return promise;
}

export async function loadOptionalModel(kind) {
  const url = MODEL_PATHS[kind];
  if (!url) return null;
  return loadGltf(url);
}

export function preloadCoreAssets() {
  return Promise.all([
    loadOptionalModel('dog'),
    loadOptionalModel('bone'),
    loadOptionalModel('chicken'),
    loadOptionalModel('biscuit'),
  ]);
}
