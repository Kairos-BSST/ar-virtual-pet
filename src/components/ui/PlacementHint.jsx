import { usePetStore } from '../../store/petStore';

export default function PlacementHint({ worldReady, worldCamError }) {
  const isPlaced = usePetStore((s) => s.isPlaced);
  const arActive = usePetStore((s) => s.arActive);
  const arSupported = usePetStore((s) => s.arSupported);
  const trackingLost = usePetStore((s) => s.trackingLost);
  const floorScan = usePetStore((s) => s.floorScan);

  if (trackingLost) return null;

  if (isPlaced) {
    return (
      <div className="pointer-events-none absolute inset-x-0 top-28 px-6 text-center">
        <p className="glass inline-block rounded-full px-4 py-2 text-xs text-white/90">
          Markerless AR: dog is world-anchored to the floor. Move freely.
        </p>
      </div>
    );
  }

  let message = 'Tap START AR for markerless floor placement';
  if (arActive) {
    message = floorScan?.message || 'Scan the real floor until a green ring appears, then tap once';
  } else if (worldCamError) {
    message = 'Allow camera, then tap START AR';
  } else if (worldReady) {
    message = 'Tap START AR — no markers needed. Scan floor, then tap the ring.';
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-8 px-6 text-center">
      <p className="glass inline-block rounded-full px-4 py-2 text-sm text-white">{message}</p>
      {arActive && (
        <p className="mt-2 text-xs text-white/75">
          Floor planes: {floorScan?.planeCount ?? 0}
          {floorScan?.ready ? ' · ready to place' : ''}
        </p>
      )}
      {arSupported && !arActive && (
        <p className="mt-2 text-xs text-white/80">Uses WebXR hit-test + floor detection (no QR / image markers).</p>
      )}
    </div>
  );
}
