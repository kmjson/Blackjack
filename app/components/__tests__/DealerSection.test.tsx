import { render, screen } from "@testing-library/react";
import { DealerSection } from "../DealerSection";
import { createCardInstance } from "../../utils/gameLogic";

describe("DealerSection", () => {
  it("should display dealer label", () => {
    render(<DealerSection dealerHand={[]} dealerTotal={0} roundOver={true} dealerHoleRevealed={true} />);
    expect(screen.getByText("Dealer")).toBeInTheDocument();
  });

  it("should show waiting message when no cards", () => {
    render(<DealerSection dealerHand={[]} dealerTotal={0} roundOver={true} dealerHoleRevealed={true} />);
    expect(screen.getByText("Waiting for your bet.")).toBeInTheDocument();
  });

  it("should display dealer cards", () => {
    const hand = [
      createCardInstance("K", "♠", 10),
      createCardInstance("Q", "♥", 10),
    ];
    render(
      <DealerSection
        dealerHand={hand}
        dealerTotal={20}
        roundOver={true}
        dealerHoleRevealed={true}
      />,
    );
    expect(screen.getByText("K♠")).toBeInTheDocument();
    expect(screen.getByText("Q♥")).toBeInTheDocument();
  });

  it("should show total when round is over", () => {
    render(
      <DealerSection
        dealerHand={[createCardInstance("K", "♠", 10)]}
        dealerTotal={10}
        roundOver={true}
        dealerHoleRevealed={true}
      />,
    );
    expect(screen.getByText(/Total: 10/)).toBeInTheDocument();
  });

  it("should show total when hole card is revealed", () => {
    render(
      <DealerSection
        dealerHand={[createCardInstance("K", "♠", 10)]}
        dealerTotal={10}
        roundOver={false}
        dealerHoleRevealed={true}
      />,
    );
    expect(screen.getByText(/Total: 10/)).toBeInTheDocument();
  });

  it("should show ?? for total when hole card not revealed", () => {
    render(
      <DealerSection
        dealerHand={[createCardInstance("K", "♠", 10)]}
        dealerTotal={10}
        roundOver={false}
        dealerHoleRevealed={false}
      />,
    );
    expect(screen.getByText(/Total: \?\?/)).toBeInTheDocument();
  });
});

