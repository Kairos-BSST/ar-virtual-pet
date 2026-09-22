import { lazy, Suspense, useState } from 'react';
import TopBar from '../components/ui/TopBar';
import BottomPanel from '../components/ui/BottomPanel';
import LevelUpOverlay from '../components/ui/LevelUpOverlay';
import PlacementHint from '../components/ui/PlacementHint';
import TrackingOverlay from '../components/ui/TrackingOverlay';
import { useHandTracking } from '../hooks/useHandTracking';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import { usePetNeeds } from '../hooks/usePetNeeds';
import { useWorldCamera } from '../hooks/useWorldCamera';
import { requestMotionPermission } from '../hooks/useDeviceOrientation';
import { usePetStore } from '../store/petStore';

const ARCanvasRoot = lazy(() => import('../components/ar/ARCanvasRoot'));

export default function ARExperience() {
  const [overlayEl, setOverlayEl] = useState(null);
  const [gesturesOn, setGesturesOn] = useState(false);
  usePetNeeds();
  const arActive = usePetStore((s) => s.arActive);
  const { videoRef: worldVideoRef, error: worldCamError, ready: worldReady } = useWorldCamera(!arActive);
  const { videoRef, error } = useHandTracking(gesturesOn && !arActive);
  const voice = useVoiceCommands();
  const listening = usePetStore((s) => s.isListening);

  return (
    <div
      id="ar-overlay"
      ref={setOverlayEl}
      className="relative h-[100dvh] w-full overflow-hidden bg-transparent"
      onPointerDown={() => {
        requestMotionPermission().catch(() => {});
      }}
    >
      <video
        ref={worldVideoRef}
        className={`pointer-events-none absolute inset-0 z-0 h-full w-full object-cover ${
          arActive ? 'hidden' : ''
        }`}
        muted
        playsInline
        autoPlay
      />

      <div className="absolute inset-0 z-[1] bg-transparent">
        <Suspense fallback={<Loader />}>
          <ARCanvasRoot overlayRoot={overlayEl} cameraPosRef={voice.cameraPosRef} />
        </Suspense>
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between">
        <TopBar />
        <PlacementHint worldReady={worldReady} worldCamError={worldCamError} />
        <TrackingOverlay />
        <div>
          <div className="pointer-events-auto mx-3 mb-2 flex items-end justify-between">
            <video
              ref={videoRef}
              className={`h-16 w-24 rounded-xl border border-white/20 object-cover opacity-80 ${
                gesturesOn ? '' : 'invisible'
              }`}
              muted
              playsInline
            />
            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={() => setGesturesOn((v) => !v)}
                className="rounded-full bg-black/40 px-3 py-1 text-[11px] text-white"
              >
                Hands {gesturesOn ? 'on' : 'off'}
              </button>
              <div id="ar-button-slot" className="pointer-events-auto" />
            </div>
          </div>
          <BottomPanel
            onVoice={voice.toggleListening}
            listening={listening}
            voiceSupported={voice.supported}
            gestureError={error}
          />
        </div>
      </div>
      <LevelUpOverlay />
    </div>
  );
}

function Loader() {
  return <div className="flex h-full items-center justify-center text-white">Loading AR companion…</div>;
}
