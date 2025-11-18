import type { CardInstance, HandOutcome } from "../types";
import { Hand } from "./Hand";
import { getNetResultForOutcome, formatNetResult } from "../utils/payouts";

type PlayerSectionProps = {
  playerHands: CardInstance[][];
  playerTotals: number[];
  handBets: number[];
  handOutcomes: HandOutcome[];
  activeHandIndex: number;
  roundOver: boolean;
  lastDealtId?: string | null;
  highlightedCardId?: string | null;
};

export const PlayerSection = ({
  playerHands,
  playerTotals,
  handBets,
  handOutcomes,
  activeHandIndex,
  roundOver,
  lastDealtId,
  highlightedCardId,
}: PlayerSectionProps) => {
  return (
    <div className="rounded-2xl border border-emerald-800 bg-emerald-900/40 p-6">
      <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">Player</p>
      <div className="mt-4 space-y-6">
        {playerHands.length === 0 ? (
          <p className="text-sm text-emerald-200">Place a bet and deal to begin.</p>
        ) : (
          playerHands.map((hand, index) => (
            <div
              key={`hand-${index}`}
              className={`rounded-xl border p-4 ${
                index === activeHandIndex && !roundOver
                  ? "border-emerald-400/80 bg-emerald-800/40"
                  : "border-emerald-900 bg-emerald-900/20"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
                Hand {index + 1}
                {index === activeHandIndex && !roundOver ? " — Your turn" : ""}
              </p>
              <p className="text-xs text-emerald-200">Bet: ${handBets[index] ?? 0}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Hand
                  hand={hand}
                  lastDealtId={lastDealtId}
                  highlightedCardId={highlightedCardId}
                />
              </div>
              <p className="mt-3 text-sm text-emerald-100">
                Total: {playerTotals[index] ?? 0}{" "}
                {handOutcomes[index] ? `— ${handOutcomes[index]}` : ""}
              </p>
              {roundOver && handOutcomes[index] ? (
                <p className="text-xs text-emerald-300">
                  {formatNetResult(getNetResultForOutcome(handOutcomes[index], handBets[index] ?? 0))}
                </p>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

