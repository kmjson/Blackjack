import { getNetResultForOutcome, formatNetResult } from "../payouts";
import { BLACKJACK_PAYOUT_MULTIPLIER } from "../../constants";

describe("payouts", () => {
  describe("getNetResultForOutcome", () => {
    it("should return null for null outcome", () => {
      expect(getNetResultForOutcome(null, 50)).toBeNull();
      expect(getNetResultForOutcome(undefined, 50)).toBeNull();
    });

    it("should calculate blackjack payout correctly", () => {
      const bet = 50;
      const result = getNetResultForOutcome("Blackjack", bet);
      expect(result).toBe(bet * BLACKJACK_PAYOUT_MULTIPLIER);
    });

    it("should calculate win payout correctly", () => {
      const bet = 50;
      const result = getNetResultForOutcome("Win", bet);
      expect(result).toBe(bet);
    });

    it("should return 0 for push", () => {
      const bet = 50;
      const result = getNetResultForOutcome("Push", bet);
      expect(result).toBe(0);
    });

    it("should return negative bet for bust", () => {
      const bet = 50;
      const result = getNetResultForOutcome("Bust", bet);
      expect(result).toBe(-bet);
    });

    it("should return negative bet for lose", () => {
      const bet = 50;
      const result = getNetResultForOutcome("Lose", bet);
      expect(result).toBe(-bet);
    });
  });

  describe("formatNetResult", () => {
    it("should format positive result as win", () => {
      expect(formatNetResult(50)).toBe("Won $50");
      expect(formatNetResult(100)).toBe("Won $100");
    });

    it("should format negative result as loss", () => {
      expect(formatNetResult(-50)).toBe("Lost $50");
      expect(formatNetResult(-100)).toBe("Lost $100");
    });

    it("should format zero as push", () => {
      expect(formatNetResult(0)).toBe("Push ($0)");
    });

    it("should return null for null input", () => {
      expect(formatNetResult(null)).toBeNull();
    });
  });
});

