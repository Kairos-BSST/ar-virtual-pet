import { GESTURES } from './constants';

const FINGER_TIPS = [4, 8, 12, 16, 20];
const FINGER_PIPS = [3, 6, 10, 14, 18];

export function fingerExtended(landmarks, tipIndex, pipIndex, isThumb = false) {
  const tip = landmarks[tipIndex];
  const pip = landmarks[pipIndex];
  if (!tip || !pip) return 0;
  if (isThumb) {
    const mcp = landmarks[2];
    return Math.abs(tip.x - mcp.x) > 0.08 ? 1 : 0;
  }
  return tip.y < pip.y - 0.02 ? 1 : 0;
}

export function extractGestureFeatures(landmarks) {
  const thumb = fingerExtended(landmarks, 4, 3, true);
  const index = fingerExtended(landmarks, 8, 6);
  const middle = fingerExtended(landmarks, 12, 10);
  const ring = fingerExtended(landmarks, 16, 14);
  const pinky = fingerExtended(landmarks, 20, 18);
  const wrist = landmarks[0];
  const indexTip = landmarks[8];
  const thumbTip = landmarks[4];
  const openness = (thumb + index + middle + ring + pinky) / 5;
  const pointDx = indexTip.x - wrist.x;
  const thumbUp = thumbTip.y < wrist.y - 0.12 && thumb === 1 ? 1 : 0;
  const raised = wrist.y < 0.42 ? 1 : 0;
  return [thumb, index, middle, ring, pinky, openness, pointDx, thumbUp, raised, wrist.y];
}

export const GESTURE_LABELS = [
  GESTURES.openPalm,
  GESTURES.pointLeft,
  GESTURES.pointRight,
  GESTURES.thumbsUp,
  GESTURES.raisedHand,
  GESTURES.closedFist,
];

/**
 * Template rows match GESTURE_LABELS. Columns match extractGestureFeatures.
 * Used as a lightweight TF.js linear classifier weight matrix.
 */
export const GESTURE_TEMPLATES = [
  [1, 1, 1, 1, 1, 1, 0, 0, 0, 0.55],
  [0, 1, 0, 0, 0, 0.25, -0.35, 0, 0, 0.55],
  [0, 1, 0, 0, 0, 0.25, 0.35, 0, 0, 0.55],
  [1, 0, 0, 0, 0, 0.2, 0, 1, 0, 0.55],
  [1, 1, 1, 1, 1, 1, 0, 0, 1, 0.28],
  [0, 0, 0, 0, 0, 0.05, 0, 0, 0, 0.55],
];

export { FINGER_TIPS, FINGER_PIPS };
