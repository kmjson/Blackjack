import { render, screen } from "@testing-library/react";
import { PlayerSection } from "../PlayerSection";
import { createCardInstance } from "../../utils/gameLogic";

describe("PlayerSection", () => {
  it("should display player label", () => {
    render(
      <PlayerSection
        playerHands={[]}
        playerTotals={[]}
        handBets={[]}
        handOutcomes={[]}
        activeHandIndex={0}
        roundOver={true}
        isDealing={false}
        dealerHoleRevealed={false}
      />,
    );
    expect(screen.getByText("Player")).toBeInTheDocument();
  });

  it("should show waiting message when no hands", () => {
    render(
      <PlayerSection
        playerHands={[]}
        playerTotals={[]}
        handBets={[]}
        handOutcomes={[]}
        activeHandIndex={0}
        roundOver={true}
        isDealing={false}
        dealerHoleRevealed={false}
      />,
    );
    expect(screen.getByText("Place a bet and deal to begin.")).toBeInTheDocument();
  });

  it("should display player hands", () => {
    const hands = [[createCardInstance("K", "♠", 10), createCardInstance("Q", "♥", 10)]];
    render(
      <PlayerSection
        playerHands={hands}
        playerTotals={[20]}
        handBets={[50]}
        handOutcomes={[null]}
        activeHandIndex={0}
        roundOver={false}
        isDealing={false}
        dealerHoleRevealed={false}
      />,
    );
    expect(screen.getByText("K♠")).toBeInTheDocument();
    expect(screen.getByText("Q♥")).toBeInTheDocument();
  });

  it("should display hand number", () => {
    const hands = [[createCardInstance("K", "♠", 10)]];
    render(
      <PlayerSection
        playerHands={hands}
        playerTotals={[10]}
        handBets={[50]}
        handOutcomes={[null]}
        activeHandIndex={0}
        roundOver={false}
        isDealing={false}
        dealerHoleRevealed={false}
      />,
    );
    expect(screen.getByText(/Hand 1/)).toBeInTheDocument();
  });

  it("should show 'Your turn' for active hand", () => {
    const hands = [[createCardInstance("K", "♠", 10)]];
    render(
      <PlayerSection
        playerHands={hands}
        playerTotals={[10]}
        handBets={[50]}
        handOutcomes={[null]}
        activeHandIndex={0}
        roundOver={false}
        isDealing={false}
        dealerHoleRevealed={false}
      />,
    );
    expect(screen.getByText(/Your turn/)).toBeInTheDocument();
  });

  it("should display bet amount", () => {
    const hands = [[createCardInstance("K", "♠", 10)]];
    render(
      <PlayerSection
        playerHands={hands}
        playerTotals={[10]}
        handBets={[50]}
        handOutcomes={[null]}
        activeHandIndex={0}
        roundOver={false}
        isDealing={false}
        dealerHoleRevealed={false}
      />,
    );
    expect(screen.getByText(/Bet: \$50/)).toBeInTheDocument();
  });

  it("should display hand total", () => {
    const hands = [[createCardInstance("K", "♠", 10)]];
    render(
      <PlayerSection
        playerHands={hands}
        playerTotals={[10]}
        handBets={[50]}
        handOutcomes={[null]}
        activeHandIndex={0}
        roundOver={false}
        isDealing={false}
        dealerHoleRevealed={false}
      />,
    );
    expect(screen.getByText(/Total: 10/)).toBeInTheDocument();
  });

  it("should display outcome when round is over", () => {
    const hands = [[createCardInstance("K", "♠", 10)]];
    render(
      <PlayerSection
        playerHands={hands}
        playerTotals={[20]}
        handBets={[50]}
        handOutcomes={["Win"]}
        activeHandIndex={0}
        roundOver={true}
        isDealing={false}
        dealerHoleRevealed={true}
      />,
    );
    expect(screen.getByText(/Won \$50/)).toBeInTheDocument();
  });

  it("should handle multiple hands from split", () => {
    const hands = [
      [createCardInstance("K", "♠", 10)],
      [createCardInstance("K", "♥", 10)],
    ];
    render(
      <PlayerSection
        playerHands={hands}
        playerTotals={[10, 10]}
        handBets={[50, 50]}
        handOutcomes={[null, null]}
        activeHandIndex={0}
        roundOver={false}
        isDealing={false}
        dealerHoleRevealed={false}
      />,
    );
    expect(screen.getByText(/Hand 1/)).toBeInTheDocument();
    expect(screen.getByText(/Hand 2/)).toBeInTheDocument();
  });

  it("should not show 'Your turn' when dealer is hitting", () => {
    const hands = [[createCardInstance("K", "♠", 10)]];
    render(
      <PlayerSection
        playerHands={hands}
        playerTotals={[10]}
        handBets={[50]}
        handOutcomes={[null]}
        activeHandIndex={0}
        roundOver={false}
        isDealing={true}
        dealerHoleRevealed={true}
      />,
    );
    expect(screen.queryByText(/Your turn/)).not.toBeInTheDocument();
  });
});

