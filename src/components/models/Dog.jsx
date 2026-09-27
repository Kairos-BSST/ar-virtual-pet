import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { MODEL_PATHS } from '../../utils/constants';
import ProceduralDog from './ProceduralDog';

const TARGET_HEIGHT = 0.42;
const CLIP_ALIASES = {
  idle: ['idle', 'Idle', 'Idle_01', 'Standing', 'stand'],
  walk: ['walk', 'Walk', 'Walking', 'Walk_01'],
  run: ['run', 'Run', 'Running', 'Run_01', 'Sprint'],
  sit: ['sit', 'Sit', 'Sitting', 'Sit_01'],
  jump: ['jump', 'Jump', 'Jump_01'],
  bark: ['bark', 'Bark', 'Bark_01', 'Speak'],
  eat: ['eat', 'Eat', 'Eating', 'Eat_01'],
  tailWag: ['tail', 'Tail', 'tailWag', 'TailWag', 'Wag', 'Happy'],
  lieDown: ['lie', 'Lie', 'Sleep', 'Rest', 'LieDown'],
  dance: ['dance', 'Dance'],
  lookAround: ['look', 'Look', 'LookAround', 'Alert'],
  stretch: ['stretch', 'Stretch'],
  sad: ['sad', 'Sad', 'Whine'],
};

function resolveClip(actions, animation) {
  if (!actions) return null;
  const names = Object.keys(actions);
  if (!names.length) return null;
  const aliases = CLIP_ALIASES[animation] || [animation];
  for (const alias of aliases) {
    const hit = names.find((n) => n.toLowerCase() === alias.toLowerCase());
    if (hit && actions[hit]) return actions[hit];
  }
  for (const alias of aliases) {
    const hit = names.find((n) => n.toLowerCase().includes(alias.toLowerCase()));
    if (hit && actions[hit]) return actions[hit];
  }
  return actions[names[0]] || null;
}

function groundAndNormalize(root) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const height = Math.max(size.y, 0.001);
  const scale = TARGET_HEIGHT / height;
  root.scale.setScalar(scale);
  root.updateMatrixWorld(true);
  const grounded = new THREE.Box3().setFromObject(root);
  root.position.x -= (grounded.min.x + grounded.max.x) * 0.5;
  root.position.z -= (grounded.min.z + grounded.max.z) * 0.5;
  root.position.y -= grounded.min.y;
  root.updateMatrixWorld(true);
  root.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.frustumCulled = false;
    }
  });
}

function GltfDog({ url, animation }) {
  const group = useRef();
  const { scene, animations } = useGLTF(url);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    groundAndNormalize(clone);
    return clone;
  }, [scene]);
  const { actions } = useAnimations(animations, group);
  const hasClips = animations?.length > 0;
  const phase = useRef(0);
  const activeClip = useRef(null);

  useEffect(() => {
    if (!hasClips) return undefined;
    const next = resolveClip(actions, animation);
    if (!next) return undefined;
    if (activeClip.current && activeClip.current !== next) {
      activeClip.current.fadeOut(0.2);
    }
    next.reset().fadeIn(0.2).play();
    activeClip.current = next;
    return () => {
      next.fadeOut(0.15);
    };
  }, [actions, animation, hasClips]);

  useFrame((_, dt) => {
    phase.current += dt;
    const node = group.current;
    if (!node || hasClips) return;
    const t = phase.current;
    let y = 0;
    let rotX = 0;
    let rotY = 0;
    let bob = 0;

    switch (animation) {
      case 'walk':
        bob = Math.sin(t * 8) * 0.015;
        rotY = Math.sin(t * 4) * 0.04;
        break;
      case 'run':
        bob = Math.abs(Math.sin(t * 14)) * 0.04;
        rotY = Math.sin(t * 7) * 0.06;
        break;
      case 'sit':
        y = -0.04;
        rotX = 0.18;
        break;
      case 'lieDown':
        y = -0.08;
        rotX = 0.35;
        break;
      case 'jump':
        y = Math.abs(Math.sin(Math.min(1, (t % 1.1) / 1.1) * Math.PI)) * 0.28;
        break;
      case 'bark':
        bob = Math.sin(t * 20) * 0.012;
        rotX = -0.08;
        break;
      case 'eat':
        y = -0.03;
        rotX = 0.35 + Math.sin(t * 10) * 0.05;
        break;
      case 'tailWag':
        rotY = Math.sin(t * 10) * 0.12;
        break;
      case 'dance':
        y = Math.abs(Math.sin(t * 8)) * 0.08;
        rotY = Math.sin(t * 5) * 0.4;
        break;
      case 'lookAround':
        rotY = Math.sin(t * 1.3) * 0.55;
        break;
      case 'stretch':
        rotX = -0.2;
        break;
      case 'sad':
        rotX = 0.22;
        y = -0.02;
        break;
      default:
        bob = Math.sin(t * 2.2) * 0.008;
        break;
    }

    node.position.y = y + bob;
    node.rotation.x = rotX;
    node.rotation.y = rotY;
  });

  return (
    <group ref={group}>
      <primitive object={model} />
    </group>
  );
}

class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

export default function DogModel({ animation, happiness, hunger, energy }) {
  const [failed, setFailed] = useState(false);
  const procedural = (
    <ProceduralDog animation={animation} happiness={happiness} hunger={hunger} energy={energy} />
  );

  if (failed) return procedural;

  return (
    <ModelErrorBoundary fallback={procedural}>
      <Suspense fallback={procedural}>
        <GltfDog
          url={MODEL_PATHS.dog}
          animation={animation}
          onError={() => setFailed(true)}
        />
      </Suspense>
    </ModelErrorBoundary>
  );
}

try {
  useGLTF.preload(MODEL_PATHS.dog);
} catch {
  /* ignore preload errors */
}
