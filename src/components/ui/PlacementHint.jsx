import { usePetStore } from '../../store/petStore';

export default function PlacementHint({ worldReady, worldCamError }) {
  const isPlaced = usePetStore((s) => s.isPlaced);
  const arActive = usePetStore((s) => s.arActive);
  const arSupported = usePetStore((s) => s.arSupported);
  const trackingLost = usePetStore((s) => s.trackingLost);

  if (trackingLost) return null;

  if (isPlaced) {
    return (
      <div className="pointer-events-none absolute inset-x-0 top-28 px-6 text-center">
        <p className="glass inline-block rounded-full px-4 py-2 text-xs text-white/90">
          Anchored to the floor. Move around — the dog stays put.
        </p>
      </div>
    );
  }

  let message = 'Aim at the floor, then tap to place the dog';
  if (arActive) {
    message = 'Scan the real floor until a green ring appears, then tap once. Tables and beds are ignored.';
  } else if (worldCamError) {
    message = 'Allow camera, then tap START AR to place on the floor';
  } else if (worldReady) {
    message = 'Tap START AR, scan the floor, then tap the green ring.';
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-8 px-6 text-center">
      <p className="glass inline-block rounded-full px-4 py-2 text-sm text-white">{message}</p>
      {arSupported && !arActive && (
        <p className="mt-2 text-xs text-white/80">START AR is required for floor anchoring.</p>
      )}
    </div>
  );
}
