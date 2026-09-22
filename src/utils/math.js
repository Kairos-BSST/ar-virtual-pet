export function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function distance2d(ax, az, bx, bz) {
  const dx = bx - ax;
  const dz = bz - az;
  return Math.hypot(dx, dz);
}

export function flattenY([x, , z], y = 0) {
  return [x, y, z];
}

export function damp(current, target, lambda, dt) {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}
