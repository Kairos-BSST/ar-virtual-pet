import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { usePetStore } from '../../store/petStore';
import PlacementReticle from './PlacementReticle';
import Companion from './Companion';
import FoodLayer from './FoodLayer';

export default function ARScene({ cameraPosRef }) {
  const { gl, camera, raycaster } = useThree();
  const arActive = usePetStore((s) => s.arActive);
  const worldCameraReady = usePetStore((s) => s.worldCameraReady);
  const isPlaced = usePetStore((s) => s.isPlaced);
  const seeThrough = arActive || worldCameraReady;

  useEffect(() => {
    const session = gl.xr.getSession?.();
    if (!session) return undefined;
    const onSelect = () => {
      const store = usePetStore.getState();
      if (store.heldFood) {
        const origin = new THREE.Vector3();
        const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        origin.copy(camera.position).add(dir.multiplyScalar(0.8));
        store.placeHeldFood([origin.x, 0, origin.z]);
        return;
      }
      if (store.isPlaced) return;
      const pos = new THREE.Vector3();
      const forward = new THREE.Vector3(0, 0, -1.2).applyQuaternion(camera.quaternion);
      pos.copy(camera.position).add(forward);
      pos.y = 0;
      store.placePet([pos.x, 0, pos.z]);
    };
    session.addEventListener('select', onSelect);
    return () => session.removeEventListener('select', onSelect);
  }, [gl, camera, arActive]);

  useEffect(() => {
    const el = gl.domElement;
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();
    const onDown = (event) => {
      const store = usePetStore.getState();
      const rect = el.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(ndc, camera);
      const onFloor = raycaster.ray.intersectPlane(plane, hit);
      if (!onFloor) return;
      if (store.heldFood) {
        store.placeHeldFood([hit.x, 0, hit.z]);
        return;
      }
      if (!store.isPlaced) store.placePet([hit.x, 0, hit.z]);
    };
    el.addEventListener('pointerdown', onDown);
    return () => el.removeEventListener('pointerdown', onDown);
  }, [camera, gl, raycaster, isPlaced]);

  return (
    <>
      <hemisphereLight args={['#ffffff', '#3d2a1c', 1.1]} />
      <directionalLight position={[2, 4, 1]} intensity={1.15} />
      <ambientLight intensity={0.35} />
      {!seeThrough && <DesktopWorld />}
      <PlacementReticle />
      <Companion cameraPosRef={cameraPosRef} />
      <FoodLayer />
    </>
  );
}

function DesktopWorld() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#1b2430" roughness={0.95} />
      </mesh>
      <gridHelper args={[8, 16, '#35506b', '#243244']} />
      <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.05} minDistance={1.2} maxDistance={4.5} />
    </>
  );
}
