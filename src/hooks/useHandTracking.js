import { useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { classifyLandmarks, primeGestureModel } from '../services/gestureService';
import { usePetStore } from '../store/petStore';

const WASM_ROOT = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export function useHandTracking(enabled) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [active, setActive] = useState(false);
  const setHandsReady = usePetStore((s) => s.setHandsReady);
  const applyGesture = usePetStore((s) => s.applyGesture);
  const cameraPosRef = useRef([0, 0, 0]);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    let landmarker;
    let stream;
    let raf;

    async function start() {
      try {
        await primeGestureModel();
        const vision = await FilesetResolver.forVisionTasks(WASM_ROOT);
        const options = {
          runningMode: 'VIDEO',
          numHands: 1,
        };
        try {
          landmarker = await HandLandmarker.createFromOptions(vision, {
            ...options,
            baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
          });
        } catch {
          landmarker = await HandLandmarker.createFromOptions(vision, {
            ...options,
            baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' },
          });
        }
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 320, height: 240 },
          audio: false,
        });
        const video = videoRef.current;
        if (!video || cancelled) return;
        video.srcObject = stream;
        await video.play();
        setHandsReady(true);
        setActive(true);

        const loop = () => {
          if (cancelled || !landmarker) return;
          if (video.readyState >= 2) {
            const result = landmarker.detectForVideo(video, performance.now());
            const landmarks = result.landmarks?.[0];
            if (landmarks) {
              const label = classifyLandmarks(landmarks);
              applyGesture(label, cameraPosRef.current);
            }
          }
          raf = requestAnimationFrame(loop);
        };
        loop();
      } catch (err) {
        if (!cancelled) setError(err.message ?? 'Hand tracking unavailable');
      }
    }

    start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      landmarker?.close?.();
      stream?.getTracks().forEach((t) => t.stop());
      setHandsReady(false);
      setActive(false);
    };
  }, [enabled, applyGesture, setHandsReady]);

  return { videoRef, error, active, cameraPosRef };
}
