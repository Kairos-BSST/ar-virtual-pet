import { FOODS } from '../../utils/constants';
import { usePetStore } from '../../store/petStore';

export default function BottomPanel({ onVoice, listening, voiceSupported, gestureError }) {
  const selectedFoodId = usePetStore((s) => s.selectedFoodId);
  const selectFood = usePetStore((s) => s.selectFood);
  const spawnHeldFood = usePetStore((s) => s.spawnHeldFood);
  const heldFood = usePetStore((s) => s.heldFood);
  const gesture = usePetStore((s) => s.gesture);
  const voiceFeedback = usePetStore((s) => s.voiceFeedback);
  const handsReady = usePetStore((s) => s.handsReady);
  const isPlaced = usePetStore((s) => s.isPlaced);

  return (
    <footer className="pointer-events-auto mx-3 mb-3 space-y-2">
      {(voiceFeedback || gestureError) && (
        <p className="glass rounded-xl px-3 py-2 text-center text-xs text-cyan-50">
          {gestureError || voiceFeedback}
        </p>
      )}
      <div className="glass rounded-2xl p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-[11px] uppercase tracking-wider text-white/60">Treats</p>
          <p className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/80">
            Gesture: {handsReady ? gesture : 'calibrating'}
          </p>
        </div>
        <div className="flex gap-2">
          {FOODS.map((food) => (
            <button
              key={food.id}
              type="button"
              onClick={() => selectFood(food.id)}
              className={`flex-1 rounded-xl px-2 py-2 text-sm transition ${
                selectedFoodId === food.id ? 'bg-white/25 text-white' : 'bg-white/5 text-white/80'
              }`}
            >
              <span className="block text-lg">{food.emoji}</span>
              {food.name}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={!isPlaced}
            onClick={spawnHeldFood}
            className="flex-1 rounded-xl bg-gradient-to-r from-orange-400 to-rose-400 py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            {heldFood ? `${heldFood.name} ready — tap floor` : 'Feed'}
          </button>
          <button
            type="button"
            onClick={onVoice}
            disabled={!voiceSupported}
            className={`w-24 rounded-xl py-3 text-sm font-semibold ${
              listening ? 'bg-rose-500 text-white' : 'bg-white/15 text-white'
            }`}
          >
            {listening ? 'Stop' : 'Voice'}
          </button>
        </div>
      </div>
    </footer>
  );
}
