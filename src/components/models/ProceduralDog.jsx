import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { wagFrequency } from '../../services/animationController';

const fur = '#c9844a';
const furDark = '#8a5428';
const cream = '#f3dcc0';
const nose = '#2a1c16';

function Limb({ position, rotation, scale = [1, 1, 1] }) {
  return (
    <mesh position={position} rotation={rotation} scale={scale} castShadow>
      <capsuleGeometry args={[0.055, 0.18, 4, 8]} />
      <meshStandardMaterial color={furDark} roughness={0.7} />
    </mesh>
  );
}

export default function ProceduralDog({ animation, happiness = 70, hunger = 70, energy = 70 }) {
  const root = useRef();
  const body = useRef();
  const head = useRef();
  const tail = useRef();
  const mouth = useRef();
  const fl = useRef();
  const fr = useRef();
  const bl = useRef();
  const br = useRef();
  const phase = useRef(0);

  const sad = hunger < 30;
  const tired = energy < 20;

  const eyeMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: sad ? '#3b2a20' : '#1a120e', roughness: 0.3 }),
    [sad],
  );

  useFrame((_, dt) => {
    phase.current += dt;
    const t = phase.current;
    const group = root.current;
    if (!group) return;

    let bodyY = 0.28;
    let bodyRotX = 0;
    let headPitch = sad ? 0.35 : 0;
    let headYaw = 0;
    let tailWag = Math.sin(t * wagFrequency(happiness)) * (happiness > 80 ? 0.9 : 0.45);
    let mouthOpen = 0.02;
    let jumpY = 0;
    const gait = animation === 'run' ? 14 : 8;
    const stride = animation === 'run' ? 0.55 : 0.35;

    if (animation === 'walk' || animation === 'run') {
      const a = Math.sin(t * gait) * stride;
      fl.current.rotation.x = a;
      br.current.rotation.x = a;
      fr.current.rotation.x = -a;
      bl.current.rotation.x = -a;
      bodyY = 0.28 + Math.abs(Math.sin(t * gait)) * (animation === 'run' ? 0.05 : 0.02);
    } else {
      if (fl.current) fl.current.rotation.x = 0.05;
      if (fr.current) fr.current.rotation.x = 0.05;
      if (bl.current) bl.current.rotation.x = 0.08;
      if (br.current) br.current.rotation.x = 0.08;
    }

    if (animation === 'sit' || (tired && animation === 'lieDown')) {
      bodyY = animation === 'lieDown' ? 0.12 : 0.2;
      bodyRotX = animation === 'lieDown' ? 0.15 : 0.45;
      if (bl.current) bl.current.rotation.x = 1.1;
      if (br.current) br.current.rotation.x = 1.1;
    }

    if (animation === 'jump') {
      const p = (t % 1);
      jumpY = Math.sin(Math.min(1, p) * Math.PI) * 0.42;
    }

    if (animation === 'bark') {
      mouthOpen = 0.08 + Math.abs(Math.sin(t * 18)) * 0.1;
      headPitch = -0.15;
    }

    if (animation === 'eat') {
      headPitch = 0.85 + Math.sin(t * 10) * 0.08;
      bodyY = 0.24;
    }

    if (animation === 'dance') {
      group.rotation.y += dt * 2.2;
      jumpY = Math.abs(Math.sin(t * 8)) * 0.12;
      tailWag = Math.sin(t * 16) * 1.1;
    }

    if (animation === 'lookAround') {
      headYaw = Math.sin(t * 1.4) * 0.7;
    }

    if (animation === 'stretch') {
      bodyRotX = -0.35;
      headPitch = -0.2;
      if (fl.current) fl.current.rotation.x = -0.6;
      if (fr.current) fr.current.rotation.x = -0.6;
    }

    if (animation === 'sad') {
      headPitch = 0.5;
      tailWag = Math.sin(t * 2) * 0.1;
    }

    if (animation === 'tailWag') {
      tailWag = Math.sin(t * wagFrequency(90)) * 1.05;
    }

    body.current.position.y = bodyY;
    body.current.rotation.x = bodyRotX;
    head.current.rotation.x = headPitch;
    head.current.rotation.y = headYaw;
    tail.current.rotation.y = tailWag;
    tail.current.rotation.x = 0.5 + (sad ? 0.4 : 0);
    mouth.current.scale.y = 1 + mouthOpen * 8;
    group.position.y = jumpY;
  });

  return (
    <group ref={root} dispose={null}>
      <group ref={body} position={[0, 0.28, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.16, 0.32, 6, 12]} />
          <meshStandardMaterial color={fur} roughness={0.62} />
        </mesh>
        <mesh position={[0, 0.02, 0.06]} scale={[0.92, 0.7, 0.85]}>
          <capsuleGeometry args={[0.14, 0.22, 4, 8]} />
          <meshStandardMaterial color={cream} roughness={0.7} />
        </mesh>
        <group ref={head} position={[0, 0.16, 0.28]}>
          <mesh castShadow>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshStandardMaterial color={fur} roughness={0.55} />
          </mesh>
          <mesh position={[0, -0.02, 0.14]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshStandardMaterial color={cream} />
          </mesh>
          <mesh position={[0, 0.0, 0.22]}>
            <sphereGeometry args={[0.04, 10, 10]} />
            <meshStandardMaterial color={nose} />
          </mesh>
          <mesh ref={mouth} position={[0, -0.05, 0.18]}>
            <boxGeometry args={[0.08, 0.02, 0.04]} />
            <meshStandardMaterial color="#4a2018" />
          </mesh>
          <mesh position={[-0.06, 0.04, 0.12]} material={eyeMat}>
            <sphereGeometry args={[0.025, 8, 8]} />
          </mesh>
          <mesh position={[0.06, 0.04, 0.12]} material={eyeMat}>
            <sphereGeometry args={[0.025, 8, 8]} />
          </mesh>
          <mesh position={[-0.12, 0.14, 0]} rotation={[0.2, 0, 0.5]}>
            <coneGeometry args={[0.06, 0.14, 8]} />
            <meshStandardMaterial color={furDark} />
          </mesh>
          <mesh position={[0.12, 0.14, 0]} rotation={[0.2, 0, -0.5]}>
            <coneGeometry args={[0.06, 0.14, 8]} />
            <meshStandardMaterial color={furDark} />
          </mesh>
        </group>
        <group ref={tail} position={[0, 0.08, -0.28]}>
          <mesh rotation={[0.8, 0, 0]} castShadow>
            <capsuleGeometry args={[0.03, 0.22, 4, 8]} />
            <meshStandardMaterial color={furDark} />
          </mesh>
        </group>
        <group ref={fl} position={[-0.1, -0.16, 0.16]}>
          <Limb />
        </group>
        <group ref={fr} position={[0.1, -0.16, 0.16]}>
          <Limb />
        </group>
        <group ref={bl} position={[-0.1, -0.16, -0.14]}>
          <Limb />
        </group>
        <group ref={br} position={[0.1, -0.16, -0.14]}>
          <Limb />
        </group>
      </group>
    </group>
  );
}
