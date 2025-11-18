import { render, screen } from "@testing-library/react";
import { Card } from "../Card";
import { createCardInstance } from "../../utils/gameLogic";

describe("Card", () => {
  it("should render card with rank and suit", () => {
    const card = createCardInstance("K", "♠", 10);
    render(<Card card={card} index={0} />);
    expect(screen.getByText("K♠")).toBeInTheDocument();
  });

  it("should render hole card as ??", () => {
    const card = createCardInstance("A", "♠", 11);
    render(<Card card={card} index={0} isHoleCard={true} />);
    expect(screen.getByText("??")).toBeInTheDocument();
  });

  it("should apply animation class when animated", () => {
    const card = createCardInstance("K", "♠", 10);
    const { container } = render(<Card card={card} index={0} isAnimated={true} />);
    const cardElement = container.querySelector('[data-card-id]');
    expect(cardElement).toHaveClass("card-enter");
  });

  it("should apply highlight class when highlighted", () => {
    const card = createCardInstance("K", "♠", 10);
    const { container } = render(<Card card={card} index={0} isHighlighted={true} />);
    const cardElement = container.querySelector('[data-card-id]');
    expect(cardElement?.className).toContain("ring-2");
  });

  it("should have correct data-card-id attribute", () => {
    const card = createCardInstance("Q", "♥", 10);
    const { container } = render(<Card card={card} index={0} />);
    const cardElement = container.querySelector(`[data-card-id="${card.instanceId}"]`);
    expect(cardElement).toBeInTheDocument();
  });
});

