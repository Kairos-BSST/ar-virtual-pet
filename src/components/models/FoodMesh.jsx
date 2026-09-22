import { useMemo } from 'react';

export function BoneMesh() {
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.028, 0.16, 4, 8]} />
        <meshStandardMaterial color="#f4efe4" roughness={0.45} />
      </mesh>
      {[[-0.1, 0.03], [-0.1, -0.03], [0.1, 0.03], [0.1, -0.03]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0]}>
          <sphereGeometry args={[0.035, 10, 10]} />
          <meshStandardMaterial color="#efe6d6" />
        </mesh>
      ))}
    </group>
  );
}

export function ChickenMesh() {
  return (
    <group>
      <mesh rotation={[0.3, 0, 0.2]}>
        <capsuleGeometry args={[0.04, 0.12, 4, 8]} />
        <meshStandardMaterial color="#e8a87c" />
      </mesh>
      <mesh position={[0.02, 0.1, 0]}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshStandardMaterial color="#f2c094" />
      </mesh>
    </group>
  );
}

export function BiscuitMesh() {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.07, 0.07, 0.025, 8]} />
      <meshStandardMaterial color="#c4a35a" roughness={0.85} />
    </mesh>
  );
}

export default function FoodMesh({ foodId }) {
  const mesh = useMemo(() => {
    if (foodId === 'chicken') return <ChickenMesh />;
    if (foodId === 'biscuit') return <BiscuitMesh />;
    return <BoneMesh />;
  }, [foodId]);
  return mesh;
}
