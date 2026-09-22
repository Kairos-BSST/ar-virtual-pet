import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { usePetStore } from '../../store/petStore';
import { xrRuntime } from '../../services/xrRuntime';

export default function PlacementReticle() {
  const group = useRef();
  const isPlaced = usePetStore((s) => s.isPlaced);
  const arActive = usePetStore((s) => s.arActive);

  useFrame(() => {
    const node = group.current;
    if (!node) return;
    if (isPlaced || !arActive || !xrRuntime.hitValid) {
      node.visible = false;
      return;
    }
    node.matrixAutoUpdate = false;
    node.matrix.copy(xrRuntime.hitMatrix);
    node.visible = true;
  });

  return (
    <group ref={group} matrixAutoUpdate={false} visible={false} frustumCulled={false}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.09, 0.14, 48]} />
        <meshBasicMaterial color="#7dffb3" transparent opacity={0.95} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <circleGeometry args={[0.02, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.85} depthWrite={false} />
      </mesh>
    </group>
  );
}
