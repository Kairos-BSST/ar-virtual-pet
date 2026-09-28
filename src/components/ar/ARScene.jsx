import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { usePetStore } from '../../store/petStore';
import PlacementReticle from './PlacementReticle';
import Companion from './Companion';
import FoodLayer from './FoodLayer';
import WorldLockedCamera from '../../hooks/useDeviceOrientation';
import XRFloorSystem from './XRFloorSystem';
import InvisibleGround from './InvisibleGround';
import { lockPlacementPose, xrRuntime } from '../../services/xrRuntime';

export default function ARScene({ cameraPosRef }) {
  const { gl, camera, raycaster } = useThree();
  const arActive = usePetStore((s) => s.arActive);
  const worldCameraReady = usePetStore((s) => s.worldCameraReady);
  const isPlaced = usePetStore((s) => s.isPlaced);
  const seeThrough = arActive || worldCameraReady;

  useEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
  }, [gl]);

  useEffect(() => {
    if (arActive) return undefined;
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
      const y = 0;
      const point = [hit.x, y, hit.z];
      if (store.heldFood) {
        store.placeHeldFood(point);
        return;
      }
      if (!store.isPlaced) {
        const matrix = new THREE.Matrix4().makeTranslation(hit.x, y, hit.z);
        xrRuntime.floorY = y;
        lockPlacementPose(matrix, new THREE.Vector3(hit.x, y, hit.z));
        store.placePet(point);
      }
    };
    el.addEventListener('pointerdown', onDown);
    return () => el.removeEventListener('pointerdown', onDown);
  }, [camera, gl, raycaster, isPlaced, arActive]);

  return (
    <>
      <XRFloorSystem />
      <WorldLockedCamera enabled={seeThrough && !arActive} />

      <hemisphereLight args={['#ffffff', '#4a3728', 0.85]} />
      <ambientLight intensity={0.55} />
      <directionalLight
        castShadow
        position={[1.5, 4.5, 2]}
        intensity={1.35}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.1}
        shadow-camera-far={12}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0002}
      />

      {/* Invisible ground: shadows + foot collision, never drawn as opaque floor */}
      <InvisibleGround />

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
      {/* Visible preview grid only outside AR; shadows still use InvisibleGround */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#1b2430" roughness={0.95} transparent opacity={0.85} />
      </mesh>
      <gridHelper args={[8, 16, '#35506b', '#243244']} />
      <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.05} minDistance={1.2} maxDistance={4.5} />
    </>
  );
}
