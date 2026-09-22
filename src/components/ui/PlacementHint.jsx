import { usePetStore } from '../../store/petStore';

export default function PlacementHint({ worldReady, worldCamError }) {
  const isPlaced = usePetStore((s) => s.isPlaced);
  const arActive = usePetStore((s) => s.arActive);
  const arSupported = usePetStore((s) => s.arSupported);

  if (isPlaced) {
    return (
      <div className="pointer-events-none absolute inset-x-0 top-28 px-6 text-center">
        <p className="glass inline-block rounded-full px-4 py-2 text-xs text-white/90">
          The dog stays on the floor. Move your phone to look around.
        </p>
      </div>
    );
  }

  let message = 'Aim at the floor, then tap to place the dog';
  if (arActive) message = 'Point at a floor until the ring appears, then tap';
  else if (worldCamError) message = 'Allow camera, then tap the floor to place the dog';
  else if (worldReady) message = 'Aim at the floor, then tap. After that, only the room should move.';

  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-8 px-6 text-center">
      <p className="glass inline-block rounded-full px-4 py-2 text-sm text-white">{message}</p>
      {arSupported && !arActive && (
        <p className="mt-2 text-xs text-white/80">START AR locks the dog to the real floor (best tracking).</p>
      )}
    </div>
  );
}
