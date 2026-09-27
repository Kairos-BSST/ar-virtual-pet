import { useEffect, useRef } from 'react';
import { usePetStore } from '../store/petStore';

const DEPTH = {
  usagePreference: ['gpu-optimized', 'cpu-optimized'],
  dataFormatPreference: ['luminance-alpha', 'float32'],
};

/** Markerless WebAR: hit-test + optional plane-detection / anchors / depth. */
const SESSION_ATTEMPTS = (overlay) => [
  {
    requiredFeatures: ['hit-test', 'anchors'],
    optionalFeatures: overlay
      ? ['plane-detection', 'depth-sensing', 'dom-overlay', 'light-estimation', 'local-floor']
      : ['plane-detection', 'depth-sensing', 'light-estimation', 'local-floor'],
    ...(overlay ? { domOverlay: { root: overlay } } : {}),
    depthSensing: DEPTH,
  },
  {
    requiredFeatures: ['hit-test'],
    optionalFeatures: overlay
      ? ['anchors', 'plane-detection', 'depth-sensing', 'dom-overlay', 'light-estimation', 'local-floor']
      : ['anchors', 'plane-detection', 'depth-sensing', 'light-estimation', 'local-floor'],
    ...(overlay ? { domOverlay: { root: overlay } } : {}),
    depthSensing: DEPTH,
  },
  {
    requiredFeatures: ['hit-test'],
    optionalFeatures: overlay ? ['anchors', 'plane-detection', 'dom-overlay'] : ['anchors', 'plane-detection'],
    ...(overlay ? { domOverlay: { root: overlay } } : {}),
  },
  {
    requiredFeatures: ['hit-test'],
    optionalFeatures: overlay ? ['dom-overlay'] : [],
    ...(overlay ? { domOverlay: { root: overlay } } : {}),
  },
];

export async function startImmersiveAR(gl, overlayRoot) {
  if (!navigator.xr) throw new Error('WebXR is not available');
  if (gl.xr.getSession()) return gl.xr.getSession();

  const overlay = overlayRoot ?? document.getElementById('ar-overlay');
  let lastError = new Error('Could not start markerless AR');

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

    navigator.xr?.isSessionSupported?.('immersive-ar').then((ok) => {
      usePetStore.getState().setArSupported(Boolean(ok));
    });

    const onStart = () => usePetStore.getState().enterAr();
    const onEnd = () => {
      usePetStore.getState().setArActive(false);
      usePetStore.getState().setTrackingLost(false);
      usePetStore.getState().setFloorScan({ ready: false, planeCount: 0, message: '' });
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
          err?.message || 'Markerless AR needs Chrome on Android with ARCore',
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
