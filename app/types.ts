export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

export type Card = {
  rank: Rank;
  suit: Suit;
  value: number;
};

export type CardInstance = Card & {
  instanceId: string;
};

export type HandOutcome = "Win" | "Lose" | "Push" | "Bust" | "Blackjack" | null;

