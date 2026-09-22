import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePetStore } from '../../store/petStore';
import FoodMesh from '../models/FoodMesh';

export default function FoodLayer() {
  const held = usePetStore((s) => s.heldFood);
  const placedFoods = usePetStore((s) => s.placedFoods);
  const heldRef = useRef();
  const { camera } = useThree();

  useFrame(() => {
    if (!held || !heldRef.current) return;
    const dir = new THREE.Vector3(0, -0.12, -0.55).applyQuaternion(camera.quaternion);
    heldRef.current.position.copy(camera.position).add(dir);
    heldRef.current.rotation.y += 0.02;
  });

  return (
    <group>
      {held && (
        <group ref={heldRef}>
          <FoodMesh foodId={held.foodId} />
        </group>
      )}
      {placedFoods.map((food) => (
        <group key={food.instanceId} position={food.position}>
          <FoodMesh foodId={food.foodId} />
        </group>
      ))}
    </group>
  );
}
