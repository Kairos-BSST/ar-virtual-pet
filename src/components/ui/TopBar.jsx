import { usePetStore } from '../../store/petStore';
import { xpProgress } from '../../utils/progression';

function Meter({ label, value, color }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wide text-white/70">
        <span>{label}</span>
        <span>{Math.round(value)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function TopBar() {
  const hunger = usePetStore((s) => s.hunger);
  const happiness = usePetStore((s) => s.happiness);
  const energy = usePetStore((s) => s.energy);
  const level = usePetStore((s) => s.level);
  const levelName = usePetStore((s) => s.levelName);
  const xp = usePetStore((s) => s.xp);

  return (
    <header className="glass pointer-events-auto mx-3 mt-3 rounded-2xl px-3 py-3">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-cyan-100/80">AR Pet Companion</p>
          <p className="text-sm font-semibold text-white">
            Lv. {level} {levelName}
          </p>
        </div>
        <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/90">XP {xp}</div>
      </div>
      <div className="flex gap-3">
        <Meter label="Hunger" value={hunger} color="linear-gradient(90deg,#fb923c,#f97316)" />
        <Meter label="Happy" value={happiness} color="linear-gradient(90deg,#fb7185,#f43f5e)" />
        <Meter label="Energy" value={energy} color="linear-gradient(90deg,#38bdf8,#6366f1)" />
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-amber-300 to-lime-300"
          style={{ width: `${xpProgress(xp, level) * 100}%` }}
        />
      </div>
    </header>
  );
}
