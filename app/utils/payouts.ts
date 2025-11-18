import type { HandOutcome } from "../types";
import { BLACKJACK_PAYOUT_MULTIPLIER } from "../constants";

export const getNetResultForOutcome = (outcome: HandOutcome | null | undefined, bet: number) => {
  if (!outcome) return null;
  switch (outcome) {
    case "Blackjack":
      return bet * BLACKJACK_PAYOUT_MULTIPLIER;
    case "Win":
      return bet;
    case "Push":
      return 0;
    case "Bust":
    case "Lose":
      return -bet;
    default:
      return null;
  }
};

export const formatNetResult = (net: number | null) => {
  if (net === null) return null;
  if (net > 0) return `Won $${net}`;
  if (net < 0) return `Lost $${Math.abs(net)}`;
  return "Push ($0)";
};

