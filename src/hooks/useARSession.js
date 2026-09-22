import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { usePetStore } from '../store/petStore';

const SESSION_ATTEMPTS = (overlay) => [
  {
    requiredFeatures: ['hit-test', 'local-floor'],
    optionalFeatures: overlay ? ['dom-overlay', 'light-estimation'] : ['light-estimation'],
    ...(overlay ? { domOverlay: { root: overlay } } : {}),
  },
  {
    requiredFeatures: ['hit-test'],
    optionalFeatures: overlay ? ['dom-overlay', 'local-floor'] : ['local-floor'],
    ...(overlay ? { domOverlay: { root: overlay } } : {}),
  },
  {
    requiredFeatures: ['hit-test'],
    optionalFeatures: ['local-floor'],
  },
  {
    requiredFeatures: ['local-floor'],
    optionalFeatures: ['hit-test'],
  },
  {
    optionalFeatures: ['hit-test', 'local-floor'],
  },
  {},
];

export async function startImmersiveAR(gl, overlayRoot) {
  if (!navigator.xr) throw new Error('WebXR is not available');
  if (gl.xr.getSession()) return gl.xr.getSession();

  const overlay = overlayRoot ?? document.getElementById('ar-overlay');
  let lastError = new Error('Could not start AR');

  try {
    gl.xr.setReferenceSpaceType('local-floor');
  } catch {
    gl.xr.setReferenceSpaceType('local');
  }

  for (const init of SESSION_ATTEMPTS(overlay)) {
    try {
      const session = await navigator.xr.requestSession('immersive-ar', init);
      await gl.xr.setSession(session);
      return session;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

export function useARSession(gl, overlayRoot) {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!gl) return undefined;
    gl.xr.enabled = true;

    const navigatorXR = navigator.xr;
    if (navigatorXR?.isSessionSupported) {
      navigatorXR.isSessionSupported('immersive-ar').then((ok) => {
        usePetStore.getState().setArSupported(Boolean(ok));
      });
    }

    const onStart = () => usePetStore.getState().setArActive(true);
    const onEnd = () => {
      usePetStore.getState().setArActive(false);
      if (buttonRef.current) buttonRef.current.textContent = 'START AR';
    };
    gl.xr.addEventListener('sessionstart', onStart);
    gl.xr.addEventListener('sessionend', onEnd);

    const mount = document.getElementById('ar-button-slot');
    const button = document.createElement('button');
    button.id = 'ar-enter-button';
    button.className = 'ar-native-button';
    button.type = 'button';
    button.textContent = 'START AR';
    button.onclick = async () => {
      const session = gl.xr.getSession();
      if (session) {
        session.end();
        return;
      }
      button.textContent = 'Starting…';
      try {
        await startImmersiveAR(gl, overlayRoot);
        button.textContent = 'EXIT AR';
      } catch (err) {
        button.textContent = 'START AR';
        usePetStore.getState().setVoiceFeedback(
          err?.message || 'AR session not supported — using world-lock camera',
        );
      }
    };
    mount?.appendChild(button);
    buttonRef.current = button;

    return () => {
      gl.xr.removeEventListener('sessionstart', onStart);
      gl.xr.removeEventListener('sessionend', onEnd);
      button.remove();
    };
  }, [gl, overlayRoot]);

  return buttonRef;
}

export function createReticle() {
  const ring = new THREE.RingGeometry(0.08, 0.1, 32);
  ring.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ color: 0x9be7ff, opacity: 0.85, transparent: true });
  const mesh = new THREE.Mesh(ring, mat);
  mesh.matrixAutoUpdate = false;
  mesh.visible = false;
  return mesh;
}
