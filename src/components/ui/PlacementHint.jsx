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
          Dog is on the floor. Move around — it stays anchored.
        </p>
      </div>
    );
  }

  let message = 'Tap START AR, then scan the floor';
  if (arActive) {
    message = floorScan?.message || 'Move your device to detect the floor.';
  } else if (worldCamError) {
    message = 'Allow camera, then tap START AR';
  } else if (worldReady) {
    message = 'Tap START AR — scan floor until the ring appears, then tap once';
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-8 px-6 text-center">
      <p className="glass inline-block rounded-full px-4 py-2 text-sm text-white">{message}</p>
      {arActive && !floorScan?.ready && (
        <p className="mt-2 text-xs text-amber-100/90">Move your device to detect the floor.</p>
      )}
      {arSupported && !arActive && (
        <p className="mt-2 text-xs text-white/80">Invisible ground + shadows — like Google AR animals.</p>
      )}
    </div>
  );
}
