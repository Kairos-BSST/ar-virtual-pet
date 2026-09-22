import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePetStore } from '../store/petStore';

const zee = new THREE.Vector3(0, 0, 1);
const euler = new THREE.Euler();
const q0 = new THREE.Quaternion();
const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));

function applyDeviceOrientation(quaternion, alpha, beta, gamma, screenAngle) {
  euler.set(beta, alpha, -gamma, 'YXZ');
  quaternion.setFromEuler(euler);
  quaternion.multiply(q1);
  quaternion.multiply(q0.setFromAxisAngle(zee, -screenAngle));
}

function screenAngleRad() {
  const angle = window.screen?.orientation?.angle ?? window.orientation ?? 0;
  return THREE.MathUtils.degToRad(angle);
}

export function useDeviceOrientation(enabled) {
  const sample = useRef({ alpha: 0, beta: 90, gamma: 0, ready: false });

  useEffect(() => {
    if (!enabled) return undefined;

    const onOrient = (event) => {
      if (event.alpha == null || event.beta == null || event.gamma == null) return;
      sample.current = {
        alpha: THREE.MathUtils.degToRad(event.alpha),
        beta: THREE.MathUtils.degToRad(event.beta),
        gamma: THREE.MathUtils.degToRad(event.gamma),
        ready: true,
      };
    };

    const start = async () => {
      const DOE = window.DeviceOrientationEvent;
      if (DOE && typeof DOE.requestPermission === 'function') {
        try {
          const state = await DOE.requestPermission();
          if (state !== 'granted') return;
        } catch {
          return;
        }
      }
      window.addEventListener('deviceorientationabsolute', onOrient, true);
      window.addEventListener('deviceorientation', onOrient, true);
    };

    start();
    return () => {
      window.removeEventListener('deviceorientationabsolute', onOrient, true);
      window.removeEventListener('deviceorientation', onOrient, true);
    };
  }, [enabled]);

  return sample;
}

export default function WorldLockedCamera({ enabled }) {
  const { camera, gl } = useThree();
  const sample = useDeviceOrientation(enabled);

  useEffect(() => {
    if (!enabled) return;
    camera.position.set(0, 1.5, 0);
    camera.fov = 70;
    camera.updateProjectionMatrix();
  }, [enabled, camera]);

  useFrame(() => {
    if (!enabled || gl.xr.isPresenting) return;
    if (!sample.current.ready) return;
    applyDeviceOrientation(
      camera.quaternion,
      sample.current.alpha,
      sample.current.beta,
      sample.current.gamma,
      screenAngleRad(),
    );
    camera.position.set(0, 1.5, 0);
  });

  return null;
}

export function requestMotionPermission() {
  const DOE = window.DeviceOrientationEvent;
  if (DOE && typeof DOE.requestPermission === 'function') {
    return DOE.requestPermission();
  }
  return Promise.resolve('granted');
}
