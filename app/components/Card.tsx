import type { CardInstance } from "../types";
import { MAX_ANIMATION_DELAY_INDEX, ANIMATION_DELAY_STEP_MS } from "../constants";

type CardProps = {
  card: CardInstance;
  index: number;
  isHoleCard?: boolean;
  isAnimated?: boolean;
  isHighlighted?: boolean;
};

export const Card = ({ card, index, isHoleCard = false, isAnimated = false, isHighlighted = false }: CardProps) => {
  return (
    <div
      data-card-id={card.instanceId}
      className={`flex h-20 w-14 items-center justify-center rounded-lg border text-lg font-semibold shadow-sm transition ${
        isHoleCard
          ? "border-emerald-700/60 bg-emerald-800 text-emerald-200 dark:border-emerald-500/60 dark:bg-emerald-950/60"
          : "border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
      } ${isHighlighted ? "ring-2 ring-amber-300 shadow-amber-300/40" : ""} ${isAnimated ? "card-enter" : ""}`}
      style={
        isAnimated
          ? { animationDelay: `${Math.min(index, MAX_ANIMATION_DELAY_INDEX) * ANIMATION_DELAY_STEP_MS}ms` }
          : undefined
      }
    >
      {isHoleCard ? <span>??</span> : <span>{card.rank}{card.suit}</span>}
    </div>
  );
};

