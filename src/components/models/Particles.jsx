import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function HeartBurst({ active }) {
  const ref = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = 12;
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        a: Math.random() * Math.PI * 2,
        s: 0.4 + Math.random() * 0.5,
        h: 0.2 + Math.random() * 0.5,
      })),
    [count],
  );

  useFrame((state) => {
    if (!ref.current || !active) return;
    const t = state.clock.elapsedTime;
    seeds.forEach((p, i) => {
      dummy.position.set(Math.cos(p.a + t) * p.s * 0.15, (t % 1.6) * p.h, Math.sin(p.a + t) * p.s * 0.15);
      dummy.scale.setScalar(0.35 + Math.sin(t * 4 + i) * 0.1);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  if (!active) return null;
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} position={[0, 0.45, 0]}>
      <sphereGeometry args={[0.035, 8, 8]} />
      <meshStandardMaterial color="#ff6b9d" emissive="#ff4d88" emissiveIntensity={0.4} />
    </instancedMesh>
  );
}

export function EatSparks({ active }) {
  const ref = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const n = 18;

  useFrame((state) => {
    if (!ref.current || !active) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < n; i += 1) {
      const a = (i / n) * Math.PI * 2 + t * 2;
      dummy.position.set(Math.cos(a) * 0.18, 0.08 + Math.abs(Math.sin(t * 6 + i)) * 0.2, Math.sin(a) * 0.18);
      dummy.scale.setScalar(0.4);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  if (!active) return null;
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, n]}>
      <sphereGeometry args={[0.018, 6, 6]} />
      <meshStandardMaterial color="#ffe08a" emissive="#ffcc55" emissiveIntensity={0.6} />
    </instancedMesh>
  );
}

export function Confetti({ active }) {
  const ref = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const n = 40;
  const colors = useMemo(() => {
    const arr = new Float32Array(n * 3);
    const c = new THREE.Color();
    for (let i = 0; i < n; i += 1) {
      c.setHSL(Math.random(), 0.75, 0.55);
      arr[i * 3] = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    }
    return arr;
  }, [n]);

  useFrame((state) => {
    if (!ref.current || !active) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < n; i += 1) {
      dummy.position.set(
        Math.sin(i + t) * 0.5,
        0.6 + ((t * 0.4 + i * 0.13) % 1.2),
        Math.cos(i * 1.7 + t) * 0.5,
      );
      dummy.rotation.set(t + i, t * 2, 0);
      dummy.scale.setScalar(0.5);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  if (!active) return null;
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, n]}>
      <boxGeometry args={[0.04, 0.02, 0.01]} />
      <meshStandardMaterial vertexColors />
      <bufferAttribute attach="geometry-attributes-color" args={[colors, 3]} />
    </instancedMesh>
  );
}
