import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePetStore } from '../../store/petStore';

export default function PlacementReticle() {
  const mesh = useRef();
  const { gl } = useThree();
  const hitSource = useRef(null);
  const localSpace = useRef(null);
  const matrix = useRef(new THREE.Matrix4());
  const isPlaced = usePetStore((s) => s.isPlaced);
  const arActive = usePetStore((s) => s.arActive);

  useEffect(() => {
    if (!arActive) return undefined;
    let source;
    const onSession = async () => {
      const session = gl.xr.getSession();
      if (!session) return;
      const viewer = await session.requestReferenceSpace('viewer');
      source = await session.requestHitTestSource?.({ space: viewer });
      hitSource.current = source;
      localSpace.current = gl.xr.getReferenceSpace();
    };
    onSession();
    gl.xr.addEventListener('sessionstart', onSession);
    return () => {
      gl.xr.removeEventListener('sessionstart', onSession);
      source?.cancel?.();
      hitSource.current = null;
    };
  }, [arActive, gl]);

  useFrame(() => {
    const reticle = mesh.current;
    if (!reticle) return;
    if (isPlaced) {
      reticle.visible = false;
      return;
    }
    const frame = gl.xr.getFrame?.();
    const src = hitSource.current;
    const space = localSpace.current || gl.xr.getReferenceSpace();
    if (!frame || !src || !space) {
      reticle.visible = false;
      return;
    }
    const hits = frame.getHitTestResults(src);
    if (hits.length) {
      const pose = hits[0].getPose(space);
      if (pose) {
        matrix.current.fromArray(pose.transform.matrix);
        reticle.matrix.copy(matrix.current);
        reticle.visible = true;
      }
    } else {
      reticle.visible = false;
    }
  });

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} matrixAutoUpdate={false} visible={false}>
      <ringGeometry args={[0.07, 0.1, 32]} />
      <meshBasicMaterial color="#9be7ff" transparent opacity={0.9} />
    </mesh>
  );
}
