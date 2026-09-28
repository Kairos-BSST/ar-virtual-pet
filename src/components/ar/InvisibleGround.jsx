import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePetStore } from '../../store/petStore';
import { xrRuntime } from '../../services/xrRuntime';

const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scl = new THREE.Vector3();

/**
 * Invisible ground: not visible to the user, but receives dog shadows
 * and acts as the collision / foot plane (Google AR animals style).
 */
export default function InvisibleGround() {
  const mesh = useRef();
  const isPlaced = usePetStore((s) => s.isPlaced);
  const arActive = usePetStore((s) => s.arActive);

  useFrame(() => {
    const node = mesh.current;
    if (!node) return;

    let y = 0;
    let x = 0;
    let z = 0;

    if (arActive && xrRuntime.placed) {
      xrRuntime.placementMatrix.decompose(_pos, _quat, _scl);
      x = _pos.x + xrRuntime.anchorOffset.x;
      y = xrRuntime.floorY ?? _pos.y;
      z = _pos.z + xrRuntime.anchorOffset.z;
    } else if (arActive && xrRuntime.hitValid) {
      x = xrRuntime.hitPosition.x;
      y = xrRuntime.floorY ?? xrRuntime.hitPosition.y;
      z = xrRuntime.hitPosition.z;
    } else if (arActive && xrRuntime.floorY != null) {
      y = xrRuntime.floorY;
    } else if (!arActive) {
      y = 0;
    }

    xrRuntime.groundY = y;
    node.position.set(isPlaced ? x : 0, y, isPlaced ? z : 0);
    node.rotation.set(-Math.PI / 2, 0, 0);
    node.visible = true;
  });

  return (
    <mesh
      ref={mesh}
      receiveShadow
      frustumCulled={false}
      // Keep in raycast layer for ground collision checks
      userData={{ isGround: true }}
    >
      <planeGeometry args={[20, 20]} />
      {/* ShadowMaterial: fully transparent except where shadows fall */}
      <shadowMaterial transparent opacity={0.42} depthWrite={false} />
    </mesh>
  );
}

/** Soft contact blob under the dog when shadow maps are limited in AR. */
export function GroundContactBlob({ visible }) {
  if (!visible) return null;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
      <circleGeometry args={[0.16, 24]} />
      <meshBasicMaterial color="#000000" transparent opacity={0.22} depthWrite={false} />
    </mesh>
  );
}
