import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePetStore } from '../../store/petStore';
import { DOG_SCALE, TAP_DISTANCE, WALK_SPEED, RUN_SPEED } from '../../utils/constants';
import { damp, distance2d } from '../../utils/math';
import { createPositionalVoice, playPositional } from '../../services/audioService';
import DogModel from '../models/Dog';
import { HeartBurst, EatSparks, Confetti } from '../models/Particles';

export default function Companion({ cameraPosRef }) {
  const group = useRef();
  const { camera, raycaster, gl } = useThree();
  const voiceRef = useRef(null);
  const voice = useMemo(() => {
    try {
      const created = createPositionalVoice(camera);
      voiceRef.current = created;
      return created;
    } catch {
      return null;
    }
  }, [camera]);
  const lastWhine = useRef(0);
  const rotY = useRef(usePetStore.getState().petRotationY);
  const [hearts, setHearts] = useState(false);

  const isPlaced = usePetStore((s) => s.isPlaced);
  const animation = usePetStore((s) => s.animation);
  const hunger = usePetStore((s) => s.hunger);
  const happiness = usePetStore((s) => s.happiness);
  const energy = usePetStore((s) => s.energy);
  const showLevelUp = usePetStore((s) => s.showLevelUp);

  useEffect(() => {
    const node = group.current;
    if (node && voice) node.add(voice);
    return () => node?.remove(voice);
  }, [voice, isPlaced]);

  useEffect(() => {
    if (animation === 'bark') playPositional(voice, happiness > 80 ? 'happyBark' : 'bark');
    if (animation === 'eat') playPositional(voice, 'eat');
    if (animation === 'jump') playPositional(voice, 'jump');
  }, [animation, voice, happiness]);

  useEffect(() => {
    if (!hearts) return undefined;
    const id = window.setTimeout(() => setHearts(false), 1600);
    return () => window.clearTimeout(id);
  }, [hearts]);

  useFrame((_, dt) => {
    const cam = camera.position;
    if (cameraPosRef) cameraPosRef.current = [cam.x, cam.y, cam.z];
    const store = usePetStore.getState();
    const dog = group.current;
    if (!dog || !store.isPlaced) return;

    if (store.hunger < 30 && performance.now() - lastWhine.current > 9000) {
      playPositional(voice, 'whine');
      lastWhine.current = performance.now();
    }

    let [x, y, z] = store.petPosition;
    if (store.targetPosition) {
      const [tx, , tz] = store.targetPosition;
      const dist = distance2d(x, z, tx, tz);
      const speed = store.moveGait === 'run' ? RUN_SPEED : WALK_SPEED;
      if (dist < 0.12) {
        x = tx;
        z = tz;
        const food = store.placedFoods.find(
          (f) => distance2d(f.position[0], f.position[2], tx, tz) < 0.2,
        );
        store.setPetPose([x, y, z], rotY.current);
        if (food) store.consumeFood(food.instanceId);
        else store.stopMoving();
      } else {
        const nx = (tx - x) / dist;
        const nz = (tz - z) / dist;
        x += nx * speed * dt;
        z += nz * speed * dt;
        rotY.current = damp(rotY.current, Math.atan2(nx, nz), 8, dt);
        store.setPetPose([x, y, z], rotY.current);
      }
    }

    dog.position.set(store.petPosition[0], store.petPosition[1], store.petPosition[2]);
    dog.rotation.y = store.petRotationY;
  });

  useEffect(() => {
    const el = gl.domElement;
    const onPointer = (event) => {
      const store = usePetStore.getState();
      if (!store.isPlaced || !group.current) return;
      const rect = el.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObject(group.current, true);
      if (!hits.length) return;
      if (hits[0].point.distanceTo(group.current.position) > TAP_DISTANCE + 0.4) return;
      const result = store.petTapped();
      setHearts(true);
      if (result.bark) playPositional(voice, 'happyBark');
    };
    el.addEventListener('pointerdown', onPointer);
    return () => el.removeEventListener('pointerdown', onPointer);
  }, [camera, gl, raycaster, voice]);

  if (!isPlaced) return null;

  return (
    <group ref={group} scale={DOG_SCALE * 2.4}>
      <DogModel animation={animation} happiness={happiness} hunger={hunger} energy={energy} />
      <HeartBurst active={hearts} />
      <EatSparks active={animation === 'eat'} />
      <Confetti active={showLevelUp} />
    </group>
  );
}
