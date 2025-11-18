import type { CardInstance } from "../types";
import { Hand } from "./Hand";

type DealerSectionProps = {
  dealerHand: CardInstance[];
  dealerTotal: number;
  roundOver: boolean;
  dealerHoleRevealed: boolean;
  lastDealtId?: string | null;
  highlightedCardId?: string | null;
};

export const DealerSection = ({
  dealerHand,
  dealerTotal,
  roundOver,
  dealerHoleRevealed,
  lastDealtId,
  highlightedCardId,
}: DealerSectionProps) => {
  return (
    <div className="rounded-2xl border border-emerald-800 bg-emerald-900/40 p-6">
      <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">Dealer</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {dealerHand.length ? (
          <Hand
            hand={dealerHand}
            hideHoleCard={!dealerHoleRevealed}
            lastDealtId={lastDealtId}
            highlightedCardId={highlightedCardId}
          />
        ) : (
          <p className="text-sm text-emerald-200">Waiting for your bet.</p>
        )}
      </div>
      <p className="mt-4 text-lg text-emerald-100">
        Total: {dealerHand.length ? (roundOver || dealerHoleRevealed ? dealerTotal : "??") : "--"}
      </p>
    </div>
  );
};

