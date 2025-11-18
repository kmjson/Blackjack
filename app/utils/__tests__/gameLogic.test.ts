import {
  createCardInstance,
  createDeck,
  shuffle,
  handValue,
  drawCard,
  isBlackjack,
  normalizeBet,
  shouldDealerStand,
} from "../gameLogic";
import type { Card, CardInstance } from "../../types";
import {
  ACE_INITIAL_VALUE,
  DEALER_STAND_THRESHOLD,
  MIN_BET,
  MAX_BET,
} from "../../constants";

describe("gameLogic", () => {
  describe("createCardInstance", () => {
    it("should create a card instance with unique IDs", () => {
      const card1 = createCardInstance("A", "♠", 11);
      const card2 = createCardInstance("K", "♥", 10);

      expect(card1.rank).toBe("A");
      expect(card1.suit).toBe("♠");
      expect(card1.value).toBe(11);
      expect(card1.instanceId).toBe("card-0");
      expect(card2.instanceId).toBe("card-1");
    });
  });

  describe("createDeck", () => {
    it("should create a deck with 52 cards", () => {
      const deck = createDeck();
      expect(deck.length).toBe(52);
    });

    it("should create a shuffled deck", () => {
      const deck1 = createDeck();
      const deck2 = createDeck();
      // Very unlikely that two shuffled decks are identical
      const isIdentical = deck1.every(
        (card, index) => card.instanceId === deck2[index].instanceId,
      );
      expect(isIdentical).toBe(false);
    });

    it("should contain all suits and ranks", () => {
      const deck = createDeck();
      const suits = new Set(deck.map((card) => card.suit));
      const ranks = new Set(deck.map((card) => card.rank));

      expect(suits.size).toBe(4);
      expect(ranks.size).toBe(13);
    });
  });

  describe("shuffle", () => {
    it("should return an array of the same length", () => {
      const cards: CardInstance[] = [
        createCardInstance("A", "♠", 11),
        createCardInstance("K", "♥", 10),
        createCardInstance("Q", "♦", 10),
      ];
      const shuffled = shuffle(cards);
      expect(shuffled.length).toBe(cards.length);
    });

    it("should contain all original cards", () => {
      const cards: CardInstance[] = [
        createCardInstance("A", "♠", 11),
        createCardInstance("K", "♥", 10),
        createCardInstance("Q", "♦", 10),
      ];
      const shuffled = shuffle(cards);
      const shuffledIds = new Set(shuffled.map((c) => c.instanceId));
      const originalIds = new Set(cards.map((c) => c.instanceId));
      expect(shuffledIds).toEqual(originalIds);
    });
  });

  describe("handValue", () => {
    it("should calculate value of non-ace cards", () => {
      const hand: Card[] = [
        { rank: "K", suit: "♠", value: 10 },
        { rank: "Q", suit: "♥", value: 10 },
      ];
      expect(handValue(hand)).toBe(20);
    });

    it("should handle ace as 11 when it doesn't bust", () => {
      const hand: Card[] = [
        { rank: "A", suit: "♠", value: ACE_INITIAL_VALUE },
        { rank: "9", suit: "♥", value: 9 },
      ];
      expect(handValue(hand)).toBe(20);
    });

    it("should handle ace as 1 when 11 would bust", () => {
      const hand: Card[] = [
        { rank: "A", suit: "♠", value: ACE_INITIAL_VALUE },
        { rank: "K", suit: "♥", value: 10 },
        { rank: "Q", suit: "♦", value: 10 },
      ];
      expect(handValue(hand)).toBe(21);
    });

    it("should handle multiple aces correctly", () => {
      const hand: Card[] = [
        { rank: "A", suit: "♠", value: ACE_INITIAL_VALUE },
        { rank: "A", suit: "♥", value: ACE_INITIAL_VALUE },
        { rank: "K", suit: "♦", value: 10 },
      ];
      // Both aces should be 1 (11 + 11 + 10 = 32, then adjust both aces: 1 + 1 + 10 = 12)
      expect(handValue(hand)).toBe(12);
    });

    it("should handle bust hand", () => {
      const hand: Card[] = [
        { rank: "K", suit: "♠", value: 10 },
        { rank: "Q", suit: "♥", value: 10 },
        { rank: "J", suit: "♦", value: 10 },
      ];
      expect(handValue(hand)).toBe(30);
    });
  });

  describe("drawCard", () => {
    it("should draw the first card from deck", () => {
      const deck: CardInstance[] = [
        createCardInstance("A", "♠", 11),
        createCardInstance("K", "♥", 10),
      ];
      const result = drawCard(deck);
      expect(result.card.rank).toBe("A");
      expect(result.rest.length).toBe(1);
      expect(result.rest[0].rank).toBe("K");
    });

    it("should throw error when deck is empty", () => {
      expect(() => drawCard([])).toThrow("Deck is empty");
    });
  });

  describe("isBlackjack", () => {
    it("should return true for blackjack (A + 10)", () => {
      const hand: Card[] = [
        { rank: "A", suit: "♠", value: ACE_INITIAL_VALUE },
        { rank: "K", suit: "♥", value: 10 },
      ];
      expect(isBlackjack(hand)).toBe(true);
    });

    it("should return false for 21 with 3 cards", () => {
      const hand: Card[] = [
        { rank: "A", suit: "♠", value: ACE_INITIAL_VALUE },
        { rank: "9", suit: "♥", value: 9 },
        { rank: "A", suit: "♦", value: ACE_INITIAL_VALUE },
      ];
      expect(isBlackjack(hand)).toBe(false);
    });

    it("should return false for non-21 hand", () => {
      const hand: Card[] = [
        { rank: "K", suit: "♠", value: 10 },
        { rank: "Q", suit: "♥", value: 10 },
      ];
      expect(isBlackjack(hand)).toBe(false);
    });
  });

  describe("normalizeBet", () => {
    it("should return MIN_BET for NaN", () => {
      expect(normalizeBet(NaN)).toBe(MIN_BET);
    });

    it("should clamp values below MIN_BET", () => {
      expect(normalizeBet(5)).toBe(MIN_BET);
    });

    it("should clamp values above MAX_BET", () => {
      expect(normalizeBet(100)).toBe(MAX_BET);
    });

    it("should round to nearest BET_STEP", () => {
      expect(normalizeBet(12)).toBe(10);
      expect(normalizeBet(13)).toBe(15);
      expect(normalizeBet(17)).toBe(15);
      expect(normalizeBet(18)).toBe(20);
    });

    it("should return valid bet amounts", () => {
      expect(normalizeBet(10)).toBe(10);
      expect(normalizeBet(15)).toBe(15);
      expect(normalizeBet(50)).toBe(50);
    });
  });

  describe("shouldDealerStand", () => {
    it("should return true when hand value is at threshold", () => {
      expect(shouldDealerStand(DEALER_STAND_THRESHOLD)).toBe(true);
    });

    it("should return true when hand value is above threshold", () => {
      expect(shouldDealerStand(DEALER_STAND_THRESHOLD + 1)).toBe(true);
      expect(shouldDealerStand(21)).toBe(true);
    });

    it("should return false when hand value is below threshold", () => {
      expect(shouldDealerStand(DEALER_STAND_THRESHOLD - 1)).toBe(false);
      expect(shouldDealerStand(16)).toBe(false);
    });
  });
});

