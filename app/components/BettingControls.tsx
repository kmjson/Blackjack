import { MIN_BET, MAX_BET, BET_STEP } from "../constants";
import { normalizeBet } from "../utils/gameLogic";

type BettingControlsProps = {
  balance: number;
  betAmount: number;
  onBetAmountChange: (amount: number) => void;
  onDeal: () => void;
  onStartOver: () => void;
  roundOver: boolean;
  isDealing: boolean;
};

export const BettingControls = ({
  balance,
  betAmount,
  onBetAmountChange,
  onDeal,
  onStartOver,
  roundOver,
  isDealing,
}: BettingControlsProps) => {
  const isGameOver = balance < MIN_BET;
  const dealDisabled = !roundOver || isDealing || (!isGameOver && (balance < MIN_BET || normalizeBet(betAmount) > balance));

  return (
    <section className="mb-8 grid gap-4 rounded-2xl border border-emerald-800 bg-emerald-900/40 p-6 md:grid-cols-2">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-400">Balance</p>
        <p className="mt-2 text-3xl font-semibold text-white">${balance}</p>
        {balance < MIN_BET ? (
          <p className="mt-2 text-sm text-rose-200">You need at least ${MIN_BET} to play.</p>
        ) : null}
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-400">Bet Amount</p>
        <div className="mt-2 flex items-center gap-3">
          <input
            type="range"
            min={MIN_BET}
            max={MAX_BET}
            step={BET_STEP}
            value={betAmount}
            onChange={(event) => onBetAmountChange(normalizeBet(Number(event.target.value)))}
            disabled={!roundOver || isGameOver}
            className="flex-1 accent-emerald-400"
          />
          <input
            type="number"
            min={MIN_BET}
            max={MAX_BET}
            step={BET_STEP}
            value={betAmount}
            readOnly
            disabled={!roundOver || isGameOver}
            className="w-20 rounded-lg border border-emerald-700 bg-emerald-950/60 px-3 py-2 text-white"
          />
        </div>
        <button
          type="button"
          className="mt-3 w-full cursor-pointer rounded-full bg-emerald-500 px-6 py-3 text-base font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-800 disabled:text-emerald-300"
          onClick={isGameOver ? onStartOver : onDeal}
          disabled={dealDisabled && !isGameOver}
        >
          {isGameOver ? "Start Over" : "Deal"}
        </button>
      </div>
    </section>
  );
};

