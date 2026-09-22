import { usePetStore } from '../../store/petStore';

export default function TrackingOverlay() {
  const trackingLost = usePetStore((s) => s.trackingLost);
  const arActive = usePetStore((s) => s.arActive);
  if (!arActive || !trackingLost) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/2 z-30 -translate-y-1/2 px-6 text-center">
      <p className="glass inline-block rounded-2xl px-5 py-3 text-sm font-medium text-amber-100">
        Move device to regain tracking
      </p>
    </div>
  );
}
