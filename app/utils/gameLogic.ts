import type { Card, CardInstance, Rank, Suit } from "../types";
import {
  ACE_INITIAL_VALUE,
  BLACKJACK_HAND_LENGTH,
  BLACKJACK_TARGET,
  DEALER_STAND_THRESHOLD,
  MAX_BET,
  MIN_BET,
  BET_STEP,
  ACE_ADJUSTMENT,
} from "../constants";

let cardInstanceCounter = 0;

export const createCardInstance = (rank: Rank, suit: Suit, value: number): CardInstance => ({
  rank,
  suit,
  value,
  instanceId: `card-${cardInstanceCounter++}`,
});

const suits: Suit[] = ["♠", "♥", "♦", "♣"];
const ranks: { label: Rank; value: number }[] = [
  { label: "A", value: ACE_INITIAL_VALUE },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 },
  { label: "6", value: 6 },
  { label: "7", value: 7 },
  { label: "8", value: 8 },
  { label: "9", value: 9 },
  { label: "10", value: 10 },
  { label: "J", value: 10 },
  { label: "Q", value: 10 },
  { label: "K", value: 10 },
];

export const createDeck = (): CardInstance[] => {
  const newDeck: CardInstance[] = [];
  suits.forEach((suit) => {
    ranks.forEach((rank) => {
      newDeck.push(createCardInstance(rank.label, suit, rank.value));
    });
  });
  return shuffle(newDeck);
};

export const shuffle = (cards: CardInstance[]): CardInstance[] => {
  const arr = [...cards];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const handValue = (hand: Card[]): number => {
  let total = hand.reduce((sum, card) => sum + card.value, 0);
  let aces = hand.filter((card) => card.rank === "A").length;

  while (total > BLACKJACK_TARGET && aces > 0) {
    total -= ACE_ADJUSTMENT;
    aces -= 1;
  }

  return total;
};

export const drawCard = (currentDeck: CardInstance[]) => {
  if (currentDeck.length === 0) {
    throw new Error("Deck is empty");
  }
  const [card, ...rest] = currentDeck;
  return { card, rest };
};

export const isBlackjack = (hand: Card[]) =>
  hand.length === BLACKJACK_HAND_LENGTH && handValue(hand) === BLACKJACK_TARGET;

export const normalizeBet = (amount: number) => {
  if (Number.isNaN(amount)) return MIN_BET;
  const clamped = Math.min(MAX_BET, Math.max(MIN_BET, amount));
  const stepped = Math.round(clamped / BET_STEP) * BET_STEP;
  return Math.max(MIN_BET, Math.min(MAX_BET, stepped));
};

export const shouldDealerStand = (handValue: number): boolean => {
  return handValue >= DEALER_STAND_THRESHOLD;
};

