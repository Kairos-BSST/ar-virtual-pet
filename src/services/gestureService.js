import * as tf from '@tensorflow/tfjs';
import { extractGestureFeatures, GESTURE_LABELS, GESTURE_TEMPLATES } from '../utils/gestures';
import { GESTURES } from '../utils/constants';

let weights = null;
let primed = false;

export async function primeGestureModel() {
  if (primed) return;
  await tf.ready();
  weights = tf.tensor2d(GESTURE_TEMPLATES);
  primed = true;
}

export function classifyLandmarks(landmarks) {
  if (!primed || !landmarks?.length) return GESTURES.none;
  const features = extractGestureFeatures(landmarks);
  const scores = tf.tidy(() => {
    const x = tf.tensor2d([features]);
    const w = weights;
    const xNorm = tf.div(x, tf.add(tf.norm(x, 'euclidean', 1, true), 1e-5));
    const wNorm = tf.div(w, tf.add(tf.norm(w, 'euclidean', 1, true), 1e-5));
    return tf.matMul(xNorm, wNorm.transpose());
  });
  const data = scores.dataSync();
  scores.dispose();
  let best = 0;
  for (let i = 1; i < data.length; i += 1) {
    if (data[i] > data[best]) best = i;
  }
  if (data[best] < 0.72) return GESTURES.none;
  return GESTURE_LABELS[best];
}

export function disposeGestureModel() {
  weights?.dispose();
  weights = null;
  primed = false;
}
