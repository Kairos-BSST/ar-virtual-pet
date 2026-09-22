import { useEffect, useRef, useState } from 'react';
import { usePetStore } from '../store/petStore';

export function useWorldCamera(enabled) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setReady(false);
      return undefined;
    }

    let stream;
    let cancelled = false;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        const video = videoRef.current;
        if (!video || cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        video.srcObject = stream;
        video.muted = true;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('autoplay', 'true');
        await video.play();
        if (!cancelled) {
          setReady(true);
          setError(null);
          usePetStore.getState().setWorldCameraReady?.(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message ?? 'Camera blocked');
          setReady(false);
        }
      }
    }

    start();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
      const video = videoRef.current;
      if (video) video.srcObject = null;
      setReady(false);
      usePetStore.getState().setWorldCameraReady?.(false);
    };
  }, [enabled]);

  return { videoRef, error, ready };
}
