import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { MODEL_PATHS } from '../../utils/constants';
import ProceduralDog from './ProceduralDog';

const TARGET_HEIGHT = 0.4;
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
  // Never fall back to a random clip for bark — model has no bark animation
  if (animation === 'bark') return null;
  return null;
}

/** Scale model and shift so bounding-box minY sits at local 0 (feet on ground). */
export function groundAndNormalize(root, targetHeight = TARGET_HEIGHT) {
  root.position.set(0, 0, 0);
  root.rotation.set(0, 0, 0);
  root.scale.set(1, 1, 1);
  root.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const height = Math.max(size.y, 0.001);
  const scale = targetHeight / height;
  root.scale.setScalar(scale);
  root.updateMatrixWorld(true);

  const grounded = new THREE.Box3().setFromObject(root);
  const centerX = (grounded.min.x + grounded.max.x) * 0.5;
  const centerZ = (grounded.min.z + grounded.max.z) * 0.5;
  root.position.set(-centerX, -grounded.min.y, -centerZ);
  root.updateMatrixWorld(true);

  root.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = false;
      child.frustumCulled = false;
    }
  });

  return -grounded.min.y;
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
    if (!next) {
      if (activeClip.current) {
        activeClip.current.fadeOut(0.15);
        activeClip.current = null;
      }
      return undefined;
    }
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
    if (!node) return;

    // Keep feet planted: no idle bobbing / floating.
    // Only jump briefly leaves the ground; bark uses pitch/scale, not lift.
    const t = phase.current;
    let y = 0;
    let rotX = 0;
    let rotY = 0;
    let scale = 1;

    if (hasClips && activeClip.current) {
      node.position.y = 0;
      node.rotation.x = 0;
      node.rotation.y = 0;
      node.scale.setScalar(1);
      return;
    }

    switch (animation) {
      case 'walk':
        rotY = Math.sin(t * 5) * 0.03;
        break;
      case 'run':
        rotY = Math.sin(t * 8) * 0.05;
        break;
      case 'sit':
        rotX = 0.12;
        break;
      case 'lieDown':
        rotX = 0.22;
        break;
      case 'jump': {
        const p = Math.min(1, (t % 1.0) / 1.0);
        y = Math.sin(p * Math.PI) * 0.18;
        break;
      }
      case 'bark':
        // No bark clip in dog.glb — subtle head nod + pulse, feet stay down
        rotX = -0.06 + Math.sin(t * 16) * 0.04;
        scale = 1 + Math.sin(t * 16) * 0.015;
        break;
      case 'eat':
        rotX = 0.2 + Math.sin(t * 8) * 0.03;
        break;
      case 'tailWag':
        rotY = Math.sin(t * 9) * 0.08;
        break;
      case 'dance':
        rotY = Math.sin(t * 4) * 0.25;
        y = Math.abs(Math.sin(t * 6)) * 0.04;
        break;
      case 'lookAround':
        rotY = Math.sin(t * 1.2) * 0.4;
        break;
      case 'stretch':
        rotX = -0.12;
        break;
      case 'sad':
        rotX = 0.1;
        break;
      default:
        // idle: completely still on the ground
        y = 0;
        rotX = 0;
        rotY = 0;
        break;
    }

    // Never sink below ground (local y >= 0)
    node.position.y = Math.max(0, y);
    node.rotation.x = rotX;
    node.rotation.y = rotY;
    node.scale.setScalar(scale);
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
        <GltfDog url={MODEL_PATHS.dog} animation={animation} />
      </Suspense>
    </ModelErrorBoundary>
  );
}

try {
  useGLTF.preload(MODEL_PATHS.dog);
} catch {
  /* ignore */
}
