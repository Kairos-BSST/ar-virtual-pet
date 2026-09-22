import { usePetStore } from '../../store/petStore';

export default function PlacementHint({ worldReady, worldCamError }) {
  const isPlaced = usePetStore((s) => s.isPlaced);
  const arActive = usePetStore((s) => s.arActive);
  const arSupported = usePetStore((s) => s.arSupported);

  if (isPlaced) return null;

  let message = 'Tap the floor to place your companion';
  if (arActive) message = 'Point at the floor, then tap to place your dog';
  else if (worldReady) message = 'You should see your room. Tap START AR for full AR, or tap to place the dog.';
  else if (worldCamError) message = 'Allow camera, then tap START AR to see your surroundings.';

  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-8 px-6 text-center">
      <p className="glass inline-block rounded-full px-4 py-2 text-sm text-white">{message}</p>
      {arSupported && !arActive && (
        <p className="mt-2 text-xs text-white/80">Tap START AR — that uses the rear camera over your real room.</p>
      )}
    </div>
  );
}
