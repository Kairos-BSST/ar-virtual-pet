import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import { usePetStore } from '../store/petStore';

export function useARSession(gl, overlayRoot) {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!gl) return undefined;
    gl.xr.enabled = true;
    gl.xr.setReferenceSpaceType('local');

    const navigatorXR = navigator.xr;
    if (navigatorXR?.isSessionSupported) {
      navigatorXR.isSessionSupported('immersive-ar').then((ok) => {
        usePetStore.getState().setArSupported(Boolean(ok));
      });
    }

    const overlay = overlayRoot ?? document.getElementById('ar-overlay');
    const button = ARButton.createButton(gl, {
      requiredFeatures: [],
      optionalFeatures: overlay
        ? ['hit-test', 'dom-overlay', 'light-estimation', 'local']
        : ['hit-test', 'light-estimation', 'local'],
      ...(overlay ? { domOverlay: { root: overlay } } : {}),
    });
    button.id = 'ar-enter-button';
    button.className = 'ar-native-button';
    button.textContent = button.textContent?.includes('NOT') ? button.textContent : 'START AR';
    const mount = document.getElementById('ar-button-slot');
    mount?.appendChild(button);
    buttonRef.current = button;

    const onStart = () => usePetStore.getState().setArActive(true);
    const onEnd = () => usePetStore.getState().setArActive(false);
    gl.xr.addEventListener('sessionstart', onStart);
    gl.xr.addEventListener('sessionend', onEnd);

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
