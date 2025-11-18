import type { CardInstance } from "../types";
import { Card } from "./Card";

type HandProps = {
  hand: CardInstance[];
  hideHoleCard?: boolean;
  lastDealtId?: string | null;
  highlightedCardId?: string | null;
};

export const Hand = ({ hand, hideHoleCard = false, lastDealtId = null, highlightedCardId = null }: HandProps) => {
  return (
    <>
      {hand.map((card, index) => {
        const isHoleCard = hideHoleCard && index === 1;
        const isAnimated = card.instanceId === lastDealtId && !isHoleCard;
        const isHighlighted = card.instanceId === highlightedCardId && !isHoleCard;

        return (
          <Card
            key={card.instanceId}
            card={card}
            index={index}
            isHoleCard={isHoleCard}
            isAnimated={isAnimated}
            isHighlighted={isHighlighted}
          />
        );
      })}
    </>
  );
};

