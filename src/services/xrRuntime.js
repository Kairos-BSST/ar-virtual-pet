import * as THREE from 'three';

export const MIN_FLOOR_AREA = 1;
export const MIN_NORMAL_Y = 0.92;
export const MAX_HEIGHT_ABOVE_FLOOR = 0.18;
export const FOOT_Y_EPSILON = 0.002;

const FLOOR_LABELS = new Set(['floor', 'ground', 'level', 'indoor-floor']);
const REJECT_LABELS = new Set([
  'wall',
  'ceiling',
  'table',
  'desk',
  'seat',
  'couch',
  'bed',
  'shelf',
  'platform',
  'door',
  'window',
  'screen',
  'cabinet',
  'counter',
]);

const _mat = new THREE.Matrix4();
const _normal = new THREE.Vector3();
const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _normalMat = new THREE.Matrix3();

export const xrRuntime = {
  session: null,
  hitSource: null,
  referenceSpace: null,
  viewerSpace: null,
  lastHitResult: null,
  hitValid: false,
  hitMatrix: new THREE.Matrix4(),
  hitPosition: new THREE.Vector3(),
  floorY: null,
  floorArea: 0,
  planesReady: false,
  anchor: null,
  anchorOffset: new THREE.Vector3(),
  tracking: true,
  placed: false,
};

export function resetXrRuntime() {
  xrRuntime.hitSource?.cancel?.();
  xrRuntime.session = null;
  xrRuntime.hitSource = null;
  xrRuntime.referenceSpace = null;
  xrRuntime.viewerSpace = null;
  xrRuntime.lastHitResult = null;
  xrRuntime.hitValid = false;
  xrRuntime.floorY = null;
  xrRuntime.floorArea = 0;
  xrRuntime.planesReady = false;
  xrRuntime.anchor = null;
  xrRuntime.anchorOffset.set(0, 0, 0);
  xrRuntime.tracking = true;
  xrRuntime.placed = false;
}

export function polygonArea(points) {
  if (!points || points.length < 3) return 0;
  let area = 0;
  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    area += points[j].x * points[i].z - points[i].x * points[j].z;
  }
  return Math.abs(area) * 0.5;
}

function labelOf(plane) {
  return (plane.semanticLabel || plane.semanticLabelHint || '').toLowerCase();
}

export function collectPlanes(frame, referenceSpace) {
  const set = frame.detectedPlanes;
  if (!set || typeof set[Symbol.iterator] !== 'function') return [];
  const planes = [];
  for (const plane of set) {
    const pose = frame.getPose(plane.planeSpace, referenceSpace);
    if (!pose) continue;
    _mat.fromArray(pose.transform.matrix);
    _normal.set(0, 1, 0).applyMatrix3(_normalMat.getNormalMatrix(_mat)).normalize();
    const y = pose.transform.position.y;
    const area = polygonArea(plane.polygon);
    const orientation = plane.orientation;
    const semantic = labelOf(plane);
    planes.push({ plane, pose, y, area, normalY: _normal.y, orientation, semantic });
  }
  return planes;
}

export function selectFloorPlane(planes) {
  const labeledFloor = planes.filter(
    (p) => FLOOR_LABELS.has(p.semantic) && p.normalY >= MIN_NORMAL_Y && p.area >= MIN_FLOOR_AREA,
  );
  const pool = labeledFloor.length ? labeledFloor : planes.filter(isGeometricFloorCandidate);
  if (!pool.length) return null;
  const lowest = Math.min(...pool.map((p) => p.y));
  const nearLowest = pool.filter((p) => p.y <= lowest + MAX_HEIGHT_ABOVE_FLOOR);
  nearLowest.sort((a, b) => b.area - a.area);
  return nearLowest[0];
}

export function isGeometricFloorCandidate(plane) {
  if (REJECT_LABELS.has(plane.semantic)) return false;
  if (plane.orientation === 'vertical') return false;
  if (plane.normalY < MIN_NORMAL_Y) return false;
  if (plane.area < MIN_FLOOR_AREA) return false;
  return true;
}

export function isValidFloorHit({ positionY, normalY, floorY }) {
  if (normalY < MIN_NORMAL_Y) return false;
  if (floorY == null) {
    return normalY >= MIN_NORMAL_Y;
  }
  if (positionY > floorY + MAX_HEIGHT_ABOVE_FLOOR) return false;
  if (positionY < floorY - 0.25) return false;
  return true;
}

export function poseNormalY(xrPose) {
  _mat.fromArray(xrPose.transform.matrix);
  _normal.set(0, 1, 0).applyMatrix3(_normalMat.getNormalMatrix(_mat)).normalize();
  return _normal.y;
}

export function matrixFromXRPose(xrPose, target) {
  target.fromArray(xrPose.transform.matrix);
  return target;
}

export function xrTransformFromMatrix(matrix) {
  matrix.decompose(_pos, _quat, _scale);
  return new XRRigidTransform(
    { x: _pos.x, y: _pos.y, z: _pos.z, w: 1 },
    { x: _quat.x, y: _quat.y, z: _quat.z, w: _quat.w },
  );
}

export async function createFloorAnchor(session, hitResult, matrix, referenceSpace) {
  if (hitResult?.createAnchor) {
    try {
      return await hitResult.createAnchor();
    } catch {
      /* fall through */
    }
  }
  if (session.requestAnchor) {
    return session.requestAnchor(xrTransformFromMatrix(matrix), referenceSpace);
  }
  return null;
}
