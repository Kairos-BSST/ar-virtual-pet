import { usePetStore } from '../../store/petStore';

export default function LevelUpOverlay() {
  const show = usePetStore((s) => s.showLevelUp);
  const level = usePetStore((s) => s.level);
  const levelName = usePetStore((s) => s.levelName);
  const dismiss = usePetStore((s) => s.dismissLevelUp);

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={dismiss}
      className="glass pointer-events-auto absolute inset-x-8 top-1/3 z-20 rounded-3xl px-6 py-8 text-center"
    >
      <p className="text-xs uppercase tracking-[0.3em] text-amber-200">Level up</p>
      <p className="mt-2 text-3xl font-bold text-white">
        {level} · {levelName}
      </p>
      <p className="mt-2 text-sm text-white/70">Tap to continue</p>
    </button>
  );
}
