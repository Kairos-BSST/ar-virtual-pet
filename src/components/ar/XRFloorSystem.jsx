import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { usePetStore } from '../../store/petStore';
import {
  xrRuntime,
  resetXrRuntime,
  collectPlanes,
  selectFloorPlane,
  isValidFloorHit,
  poseNormalY,
  matrixFromXRPose,
  createFloorAnchor,
  lockPlacementPose,
} from '../../services/xrRuntime';

export default function XRFloorSystem() {
  const { gl } = useThree();
  const placing = useRef(false);
  const arActive = usePetStore((s) => s.arActive);

  useEffect(() => {
    if (!arActive) {
      resetXrRuntime();
      usePetStore.getState().setFloorScan({ ready: false, planeCount: 0, message: '' });
      return undefined;
    }

    let cancelled = false;
    let session = gl.xr.getSession();

    const onSelect = async () => {
      const store = usePetStore.getState();
      if (!xrRuntime.hitValid || placing.current) return;
      if (store.heldFood) {
        store.placeHeldFood([
          xrRuntime.hitPosition.x,
          xrRuntime.hitPosition.y,
          xrRuntime.hitPosition.z,
        ]);
        return;
      }
      if (store.isPlaced) return;
      placing.current = true;
      const hitResult = xrRuntime.lastHitResult;
      const matrix = xrRuntime.hitMatrix.clone();
      const position = xrRuntime.hitPosition.clone();
      try {
        const active = gl.xr.getSession();
        const space = gl.xr.getReferenceSpace() || xrRuntime.referenceSpace;
        const anchor = await createFloorAnchor(active, hitResult, matrix, space);
        xrRuntime.anchor = anchor;
        lockPlacementPose(matrix, position);
        store.placePet([position.x, position.y, position.z]);
        store.setVoiceFeedback(anchor ? 'Dog anchored to the floor' : 'Dog locked to floor plane');
        store.setFloorScan({ ready: true, planeCount: xrRuntime.planeCount, message: 'Anchored' });
      } catch {
        lockPlacementPose(matrix, position);
        store.placePet([position.x, position.y, position.z]);
        store.setVoiceFeedback('Dog locked to detected floor');
      } finally {
        placing.current = false;
      }
    };

    const boot = async (xrSession) => {
      if (!xrSession || cancelled) return;
      xrRuntime.session = xrSession;
      try {
        xrRuntime.viewerSpace = await xrSession.requestReferenceSpace('viewer');
        xrRuntime.referenceSpace = gl.xr.getReferenceSpace();
        const options = { space: xrRuntime.viewerSpace };
        try {
          xrRuntime.hitSource = await xrSession.requestHitTestSource({
            ...options,
            entityTypes: ['plane'],
          });
        } catch {
          try {
            xrRuntime.hitSource = await xrSession.requestHitTestSource({
              ...options,
              entityTypes: ['plane', 'mesh'],
            });
          } catch {
            xrRuntime.hitSource = await xrSession.requestHitTestSource(options);
          }
        }
        usePetStore.getState().setFloorScan({
          ready: false,
          planeCount: 0,
          message: 'Scan the floor slowly…',
        });
      } catch {
        xrRuntime.hitSource = null;
        usePetStore.getState().setFloorScan({
          ready: false,
          planeCount: 0,
          message: 'Hit-test unavailable on this device',
        });
      }
    };

    const onSessionStart = () => {
      session = gl.xr.getSession();
      session?.addEventListener('select', onSelect);
      boot(session);
    };

    if (session) {
      session.addEventListener('select', onSelect);
      boot(session);
    }
    gl.xr.addEventListener('sessionstart', onSessionStart);
    const onEnd = () => {
      resetXrRuntime();
      usePetStore.getState().setTrackingLost(false);
      usePetStore.getState().setFloorScan({ ready: false, planeCount: 0, message: '' });
    };
    gl.xr.addEventListener('sessionend', onEnd);

    return () => {
      cancelled = true;
      session?.removeEventListener('select', onSelect);
      gl.xr.removeEventListener('sessionstart', onSessionStart);
      gl.xr.removeEventListener('sessionend', onEnd);
    };
  }, [arActive, gl]);

  useFrame(() => {
    if (!arActive) return;
    const frame = gl.xr.getFrame?.();
    const space = gl.xr.getReferenceSpace() || xrRuntime.referenceSpace;
    xrRuntime.referenceSpace = space;
    const store = usePetStore.getState();

    if (!frame || !space) {
      setTracking(false, store);
      return;
    }

    const viewer = frame.getViewerPose(space);
    if (!viewer) {
      setTracking(false, store);
      return;
    }

    const planes = collectPlanes(frame, space);
    xrRuntime.planeCount = planes.length;
    const floor = selectFloorPlane(planes);
    if (floor) {
      xrRuntime.floorY = floor.y;
      xrRuntime.floorArea = floor.area;
      xrRuntime.planesReady = true;
    }

    if (!store.isPlaced) {
      xrRuntime.lastHitResult = null;
      xrRuntime.hitValid = false;
      const src = xrRuntime.hitSource;
      if (src) {
        const hits = frame.getHitTestResults(src);
        for (const hit of hits) {
          const pose = hit.getPose(space);
          if (!pose) continue;
          const normalY = poseNormalY(pose);
          const y = pose.transform.position.y;
          if (normalY >= 0.9) {
            xrRuntime.floorY = xrRuntime.floorY == null ? y : Math.min(xrRuntime.floorY, y);
          }
          if (
            isValidFloorHit({
              positionY: y,
              normalY,
              floorY: xrRuntime.floorY,
            })
          ) {
            xrRuntime.lastHitResult = hit;
            xrRuntime.hitValid = true;
            matrixFromXRPose(pose, xrRuntime.hitMatrix);
            xrRuntime.hitPosition.set(
              pose.transform.position.x,
              pose.transform.position.y,
              pose.transform.position.z,
            );
            break;
          }
        }
      }

      store.setFloorScan({
        ready: xrRuntime.hitValid,
        planeCount: xrRuntime.planeCount,
        message: xrRuntime.hitValid
          ? 'Floor found — tap to place'
          : xrRuntime.planesReady
            ? 'Aim at the lowest floor surface'
            : 'Move phone to detect floor',
      });
    } else if (xrRuntime.anchor) {
      const pose = frame.getPose(xrRuntime.anchor.anchorSpace, space);
      if (!pose) {
        setTracking(false, store);
        return;
      }
      matrixFromXRPose(pose, xrRuntime.placementMatrix);
      xrRuntime.hitMatrix.copy(xrRuntime.placementMatrix);
    } else if (xrRuntime.placed) {
      xrRuntime.hitMatrix.copy(xrRuntime.placementMatrix);
    }

    setTracking(true, store);
  });

  return null;
}

function setTracking(ok, store) {
  xrRuntime.tracking = ok;
  if (store.trackingLost === ok) store.setTrackingLost(!ok);
}
