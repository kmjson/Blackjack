import { render, screen } from "@testing-library/react";
import { Hand } from "../Hand";
import { createCardInstance } from "../../utils/gameLogic";

describe("Hand", () => {
  it("should render all cards in hand", () => {
    const hand = [
      createCardInstance("K", "♠", 10),
      createCardInstance("Q", "♥", 10),
    ];
    render(<Hand hand={hand} />);
    expect(screen.getByText("K♠")).toBeInTheDocument();
    expect(screen.getByText("Q♥")).toBeInTheDocument();
  });

  it("should hide second card when hideHoleCard is true", () => {
    const hand = [
      createCardInstance("K", "♠", 10),
      createCardInstance("A", "♥", 11),
    ];
    render(<Hand hand={hand} hideHoleCard={true} />);
    expect(screen.getByText("K♠")).toBeInTheDocument();
    expect(screen.getByText("??")).toBeInTheDocument();
    expect(screen.queryByText("A♥")).not.toBeInTheDocument();
  });

  it("should animate last dealt card", () => {
    const hand = [
      createCardInstance("K", "♠", 10),
      createCardInstance("Q", "♥", 10),
    ];
    const { container } = render(
      <Hand hand={hand} lastDealtId={hand[1].instanceId} />,
    );
    const cards = container.querySelectorAll('[data-card-id]');
    // Second card should have animation class
    expect(cards[1]).toHaveClass("card-enter");
  });

  it("should highlight specified card", () => {
    const hand = [
      createCardInstance("K", "♠", 10),
      createCardInstance("Q", "♥", 10),
    ];
    const { container } = render(
      <Hand hand={hand} highlightedCardId={hand[0].instanceId} />,
    );
    const cards = container.querySelectorAll('[data-card-id]');
    expect(cards[0].className).toContain("ring-2");
  });
});

