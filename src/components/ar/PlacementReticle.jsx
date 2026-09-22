import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePetStore } from '../../store/petStore';

export default function PlacementReticle() {
  const mesh = useRef();
  const { gl, camera } = useThree();
  const hitSource = useRef(null);
  const localSpace = useRef(null);
  const matrix = useRef(new THREE.Matrix4());
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const target = useRef(new THREE.Vector3());
  const isPlaced = usePetStore((s) => s.isPlaced);
  const arActive = usePetStore((s) => s.arActive);

  useEffect(() => {
    if (!arActive) return undefined;
    let source;
    const onSession = async () => {
      const session = gl.xr.getSession();
      if (!session) return;
      try {
        const viewer = await session.requestReferenceSpace('viewer');
        source = await session.requestHitTestSource?.({ space: viewer });
        hitSource.current = source;
        localSpace.current = gl.xr.getReferenceSpace();
      } catch {
        hitSource.current = null;
      }
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
    if (frame && src && space) {
      const hits = frame.getHitTestResults(src);
      if (hits.length) {
        const pose = hits[0].getPose(space);
        if (pose) {
          matrix.current.fromArray(pose.transform.matrix);
          reticle.matrix.copy(matrix.current);
          reticle.visible = true;
          const pos = new THREE.Vector3().setFromMatrixPosition(reticle.matrix);
          usePetStore.getState().setHitPose([pos.x, pos.y, pos.z]);
          return;
        }
      }
    }

    camera.updateMatrixWorld();
    const origin = camera.getWorldPosition(new THREE.Vector3());
    const dir = camera.getWorldDirection(new THREE.Vector3());
    const ray = new THREE.Ray(origin, dir);
    const hit = ray.intersectPlane(plane.current, target.current);
    if (hit) {
      reticle.position.copy(target.current);
      reticle.quaternion.identity();
      reticle.rotateX(-Math.PI / 2);
      reticle.matrixAutoUpdate = true;
      reticle.updateMatrix();
      reticle.visible = true;
      usePetStore.getState().setHitPose([target.current.x, 0, target.current.z]);
    } else {
      reticle.visible = false;
    }
  });

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <ringGeometry args={[0.08, 0.12, 32]} />
      <meshBasicMaterial color="#9be7ff" transparent opacity={0.9} />
    </mesh>
  );
}
