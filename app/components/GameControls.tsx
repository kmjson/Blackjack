type GameControlsProps = {
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
  onSplit: () => void;
  roundOver: boolean;
  isDealing: boolean;
  canDouble: boolean;
  canSplit: boolean;
};

export const GameControls = ({
  onHit,
  onStand,
  onDouble,
  onSplit,
  roundOver,
  isDealing,
  canDouble,
  canSplit,
}: GameControlsProps) => {
  return (
    <div className="mt-10 flex flex-wrap gap-4">
      <button
        type="button"
        className="flex-1 cursor-pointer rounded-full bg-emerald-500 px-6 py-3 text-base font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-700/60 disabled:text-emerald-200"
        onClick={onHit}
        disabled={roundOver || isDealing}
      >
        Hit
      </button>
      <button
        type="button"
        className="flex-1 cursor-pointer rounded-full border border-emerald-500 px-6 py-3 text-base font-semibold text-emerald-100 transition hover:border-emerald-300 hover:text-white disabled:cursor-not-allowed disabled:border-emerald-800 disabled:text-emerald-400"
        onClick={onStand}
        disabled={roundOver || isDealing}
      >
        Stand
      </button>
      <button
        type="button"
        className="flex-1 cursor-pointer rounded-full border border-amber-400 px-6 py-3 text-base font-semibold text-amber-100 transition hover:border-amber-200 hover:text-white disabled:cursor-not-allowed disabled:border-amber-900 disabled:text-amber-500"
        onClick={onDouble}
        disabled={!canDouble}
      >
        Double
      </button>
      <button
        type="button"
        className="flex-1 cursor-pointer rounded-full border border-sky-400 px-6 py-3 text-base font-semibold text-sky-100 transition hover:border-sky-200 hover:text-white disabled:cursor-not-allowed disabled:border-sky-900 disabled:text-sky-500"
        onClick={onSplit}
        disabled={!canSplit}
      >
        Split
      </button>
    </div>
  );
};

