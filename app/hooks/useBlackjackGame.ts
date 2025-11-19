import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CardInstance, HandOutcome } from "../types";
import {
  STARTING_BALANCE,
  MIN_BET,
  DEAL_DELAY,
  BLACKJACK_TARGET,
  DEALER_STAND_THRESHOLD,
  BLACKJACK_HAND_LENGTH,
  BLACKJACK_TOTAL_PAYOUT,
  WIN_PAYOUT_MULTIPLIER,
  HIGHLIGHT_TIMEOUT_MS,
} from "../constants";
import { createDeck, drawCard, handValue, isBlackjack, normalizeBet } from "../utils/gameLogic";
import { sleep, waitForAnimation } from "../utils/animations";

/**
 * Custom hook that manages all blackjack game state and logic.
 * Handles card dealing, player actions (hit, stand, double, split), dealer logic,
 * round resolution, payouts, and animations.
 *
 * @returns Object containing all game state and action handlers
 */
export const useBlackjackGame = () => {
  // Game state
  const [balance, setBalance] = useState<number>(STARTING_BALANCE); // Player's current balance
  const [betAmount, setBetAmount] = useState<number>(MIN_BET); // Current bet amount selected by player
  const [deck, setDeck] = useState<CardInstance[]>([]); // Current deck of cards
  const [playerHands, setPlayerHands] = useState<CardInstance[][]>([]); // Array of player hands (supports splits)
  const [handBets, setHandBets] = useState<number[]>([]); // Bet amount for each hand (matches playerHands index)
  const [activeHandIndex, setActiveHandIndex] = useState<number>(0); // Index of the hand currently being played
  const [handOutcomes, setHandOutcomes] = useState<HandOutcome[]>([]); // Outcome for each hand (Win, Lose, Push, etc.)
  const [hasDoubled, setHasDoubled] = useState<boolean[]>([]); // Tracks if each hand has been doubled (can only double once)
  const [dealerHand, setDealerHand] = useState<CardInstance[]>([]); // Dealer's hand
  const [status, setStatus] = useState<string>("Place your bet to begin."); // Status message displayed to player
  const [roundOver, setRoundOver] = useState<boolean>(true); // Whether the current round is complete
  const [isDealing, setIsDealing] = useState<boolean>(false); // Whether cards are currently being dealt (disables buttons)

  // Animation state
  const [lastDealtId, setLastDealtId] = useState<string | null>(null); // ID of the last card dealt (for animation)
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null); // ID of card to highlight with yellow border
  const [dealerHoleRevealed, setDealerHoleRevealed] = useState<boolean>(false); // Whether dealer's face-down card is revealed
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null); // Ref to manage highlight timeout cleanup

  // Cleanup: Clear any pending highlight timeout when component unmounts
  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  // Computed values: Calculate hand totals for display
  const dealerTotal = useMemo(() => handValue(dealerHand), [dealerHand]);
  const playerTotals = useMemo(() => playerHands.map((hand) => handValue(hand)), [playerHands]);

  /**
   * Starts a new round of blackjack.
   * - Validates bet amount and balance
   * - Creates and shuffles a fresh deck
   * - Deals initial cards (player, dealer, player, dealer) with animations
   * - Checks for immediate blackjacks and resolves them
   * - Updates all game state for the new round
   */
  const startRound = useCallback(async () => {
    if (!roundOver || isDealing) return;

    const normalizedBet = normalizeBet(betAmount);
    if (balance < normalizedBet) {
      setStatus("Insufficient funds for that bet.");
      return;
    }

    // Initialize round state
    const freshDeck = createDeck();
    setBalance((prev) => prev - normalizedBet);
    setDeck(freshDeck);
    setPlayerHands([[]]);
    setHandBets([normalizedBet]);
    setHandOutcomes([null]);
    setHasDoubled([false]);
    setActiveHandIndex(0);
    setDealerHand([]);
    setRoundOver(false);
    setStatus("Dealing cards...");
    setIsDealing(true);
    setLastDealtId(null);
    setHighlightedCardId(null);
    setDealerHoleRevealed(false);
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }

    // Deal initial cards: player, dealer, player, dealer
    const playerBuffer: CardInstance[][] = [[]];
    const dealerBuffer: CardInstance[] = [];
    const sequence: ("player" | "dealer")[] = ["player", "dealer", "player", "dealer"];
    let workingDeck = freshDeck;

    for (const recipient of sequence) {
      await sleep(DEAL_DELAY);
      const draw = drawCard(workingDeck);
      workingDeck = draw.rest;
      setLastDealtId(draw.card.instanceId);
      setHighlightedCardId(draw.card.instanceId);

      if (recipient === "player") {
        playerBuffer[0] = [...playerBuffer[0], draw.card];
        setPlayerHands(playerBuffer.map((hand) => [...hand]));
      } else {
        dealerBuffer.push(draw.card);
        setDealerHand([...dealerBuffer]);
      }

      // Wait for animation to complete before dealing next card
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await waitForAnimation(draw.card.instanceId);
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
      highlightTimeoutRef.current = setTimeout(() => {
        setHighlightedCardId(null);
        highlightTimeoutRef.current = null;
      }, HIGHLIGHT_TIMEOUT_MS);
    }

    setDeck(workingDeck);
    setIsDealing(false);
    setStatus("Choose your move: hit, stand, double, or split.");

    // Check for immediate blackjacks (both players have 21 with 2 cards)
    const playerHasBlackjack = isBlackjack(playerBuffer[0]);
    const dealerHasBlackjack = isBlackjack(dealerBuffer);

    setPlayerHands(playerBuffer.map((hand) => [...hand]));
    setDealerHand([...dealerBuffer]);

    // Resolve blackjack scenarios immediately
    if (playerHasBlackjack || dealerHasBlackjack) {
      setRoundOver(true);
      if (dealerHasBlackjack) {
        setDealerHoleRevealed(true); // Reveal dealer's card if they have blackjack
      }

      if (playerHasBlackjack && dealerHasBlackjack) {
        setStatus("Both have blackjack. Push.");
        setHandOutcomes(["Push"]);
        setBalance((prev) => prev + normalizedBet); // Return bet
      } else if (playerHasBlackjack) {
        setStatus("Blackjack! Paid 2:1.");
        setHandOutcomes(["Blackjack"]);
        setBalance((prev) => prev + normalizedBet * BLACKJACK_TOTAL_PAYOUT); // Bet + 2x payout
      } else {
        setStatus("Dealer has blackjack. You lose this round.");
        setHandOutcomes(["Lose"]);
      }
    }
  }, [balance, betAmount, isDealing, roundOver]);

  /**
   * Resolves the dealer's turn and calculates round outcomes.
   * - Reveals the dealer's face-down card with animation
   * - Dealer hits until they reach 17 or higher (standard blackjack rule)
   * - Compares each player hand to dealer's final hand
   * - Calculates payouts (wins pay 2:1, pushes return bet, losses pay nothing)
   * - Updates balance and round state
   *
   * @param currentHands - All player hands at the end of their turns
   * @param currentDeck - Current deck state
   * @param currentBets - Bet amounts for each hand
   */
  const resolveDealer = useCallback(
    async (currentHands: CardInstance[][], currentDeck: CardInstance[], currentBets: number[]) => {
      let workingDeck = currentDeck;
      let workingDealer = [...dealerHand];

      setIsDealing(true);

      // Reveal dealer's face-down card (second card) with animation
      if (workingDealer.length >= 2) {
        setLastDealtId(workingDealer[1].instanceId);
        setHighlightedCardId(workingDealer[1].instanceId);
        setDealerHoleRevealed(true);
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        await waitForAnimation(workingDealer[1].instanceId);
        if (highlightTimeoutRef.current) {
          clearTimeout(highlightTimeoutRef.current);
        }
        highlightTimeoutRef.current = setTimeout(() => {
          setHighlightedCardId(null);
          highlightTimeoutRef.current = null;
        }, HIGHLIGHT_TIMEOUT_MS);
      }

      // Dealer must hit until they reach 17 or higher (standard blackjack rule)
      while (handValue(workingDealer) < DEALER_STAND_THRESHOLD && workingDeck.length > 0) {
        const next = drawCard(workingDeck);
        workingDeck = next.rest;
        await sleep(DEAL_DELAY);
        workingDealer = [...workingDealer, next.card];
        setDealerHand(workingDealer);
        setLastDealtId(next.card.instanceId);
        setHighlightedCardId(next.card.instanceId);
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        await waitForAnimation(next.card.instanceId);
        if (highlightTimeoutRef.current) {
          clearTimeout(highlightTimeoutRef.current);
        }
        highlightTimeoutRef.current = setTimeout(() => {
          setHighlightedCardId(null);
          highlightTimeoutRef.current = null;
        }, HIGHLIGHT_TIMEOUT_MS);
      }

      // Calculate outcomes for each player hand
      const dealerScore = handValue(workingDealer);
      let payout = 0;

      const nextOutcomes = currentHands.map((hand, index) => {
        const existing = handOutcomes[index];
        // If hand already has a final outcome (Bust, Blackjack, or Lose), keep it
        if (existing === "Bust" || existing === "Blackjack" || existing === "Lose") {
          return existing;
        }

        const playerScore = handValue(hand);
        let outcome: HandOutcome;

        // Determine outcome based on scores
        // Player busts always lose, regardless of dealer
        if (playerScore > BLACKJACK_TARGET) {
          outcome = "Bust";
        } else if (dealerScore > BLACKJACK_TARGET) {
          outcome = "Win"; // Dealer busts, player wins
        } else if (playerScore > dealerScore) {
          outcome = "Win"; // Player has higher score
        } else if (playerScore < dealerScore) {
          outcome = "Lose"; // Dealer has higher score
        } else {
          outcome = "Push"; // Tie
        }

        // Calculate payout (wins pay 2:1, pushes return bet)
        const bet = currentBets[index] ?? 0;
        if (outcome === "Win") payout += bet * WIN_PAYOUT_MULTIPLIER;
        if (outcome === "Push") payout += bet;

        return outcome;
      });

      // Update balance with total payout
      if (payout > 0) {
        setBalance((prevBalance) => prevBalance + payout);
      }

      // Finalize round state
      setDealerHand(workingDealer);
      setDeck(workingDeck);
      setHandOutcomes(nextOutcomes);
      setRoundOver(true);
      setIsDealing(false);
      setStatus("Round complete. Start a new round when ready.");
    },
    [dealerHand, handOutcomes],
  );

  /**
   * Moves to the next player hand or starts dealer's turn if all hands are complete.
   * Called after a hand is finished (stand, bust, or 21).
   *
   * @param nextHands - Updated player hands
   * @param nextDeck - Updated deck state
   * @param nextBets - Updated bet amounts
   * @param message - Optional status message for next hand
   */
  const moveToNextHand = useCallback(
    async (nextHands: CardInstance[][], nextDeck: CardInstance[], nextBets: number[], message?: string) => {
      if (activeHandIndex + 1 < nextHands.length) {
        // Move to next hand if there are more hands (from split)
        setActiveHandIndex((prev) => prev + 1);
        setStatus(message ?? "Next hand — choose your move.");
      } else {
        // All hands complete, start dealer's turn
        setStatus("Dealer's turn...");
        setIsDealing(true);
        await sleep(DEAL_DELAY);
        await resolveDealer(nextHands, nextDeck, nextBets);
      }
    },
    [activeHandIndex, resolveDealer],
  );

  /**
   * Player action: Hit (draw another card).
   * - Draws a card and adds it to the current hand
   * - Animates the card being dealt
   * - Checks if hand busts (>21) or reaches 21
   * - Automatically moves to next hand if busted or reached 21
   */
  const handleHit = useCallback(async () => {
    if (roundOver || isDealing || deck.length === 0 || !playerHands[activeHandIndex]) return;

    const next = drawCard(deck);
    const nextHand = [...playerHands[activeHandIndex], next.card];
    const updatedHands = playerHands.map((hand, idx) => (idx === activeHandIndex ? nextHand : hand));
    const updatedDeck = next.rest;

    // Animate card being dealt
    setDeck(updatedDeck);
    setIsDealing(true);
    await sleep(DEAL_DELAY);
    setLastDealtId(next.card.instanceId);
    setHighlightedCardId(next.card.instanceId);
    setPlayerHands(updatedHands);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await waitForAnimation(next.card.instanceId);
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedCardId(null);
      highlightTimeoutRef.current = null;
    }, HIGHLIGHT_TIMEOUT_MS);
    setIsDealing(false);

    // Check hand value and handle bust/21 scenarios
    const total = handValue(nextHand);
    if (total > BLACKJACK_TARGET) {
      // Hand busted, mark as bust and move to next hand
      setHandOutcomes((prev) =>
        prev.map((outcome, idx) => (idx === activeHandIndex ? "Bust" : outcome)),
      );
      setStatus("You busted this hand.");
      await moveToNextHand(updatedHands, updatedDeck, handBets);
    } else if (total === BLACKJACK_TARGET) {
      // Reached 21, automatically stand and move to next hand
      setStatus("21! Standing automatically.");
      await moveToNextHand(updatedHands, updatedDeck, handBets);
    } else {
      // Hand still playable, allow more actions
      setStatus("Hit, stand, double, or split?");
    }
  }, [activeHandIndex, deck, handBets, isDealing, moveToNextHand, playerHands, roundOver]);

  /**
   * Player action: Stand (keep current hand and end turn).
   * Simply moves to the next hand or starts dealer's turn.
   */
  const handleStand = useCallback(async () => {
    if (roundOver || isDealing || !playerHands[activeHandIndex]) return;
    setStatus("Standing on this hand.");
    await moveToNextHand(playerHands, deck, handBets);
  }, [activeHandIndex, deck, handBets, isDealing, moveToNextHand, playerHands, roundOver]);

  /**
   * Player action: Double (double bet, take one card, then automatically stand).
   * - Can only be done on first two cards
   * - Can only be done once per hand
   * - Requires sufficient balance
   * - Doubles the bet and draws exactly one card
   * - Automatically stands after drawing the card
   */
  const handleDouble = useCallback(async () => {
    const currentHand = playerHands[activeHandIndex];
    const currentBet = handBets[activeHandIndex] ?? 0;
    // Validate double conditions
    if (
      roundOver ||
      isDealing ||
      deck.length === 0 ||
      !currentHand ||
      currentHand.length !== BLACKJACK_HAND_LENGTH || // Must have exactly 2 cards
      hasDoubled[activeHandIndex] || // Can't double twice
      currentBet === 0 ||
      balance < currentBet // Need balance to double bet
    ) {
      return;
    }

    const next = drawCard(deck);
    const doubledHand = [...currentHand, next.card];
    const updatedHands = playerHands.map((hand, idx) => (idx === activeHandIndex ? doubledHand : hand));
    const updatedDeck = next.rest;
    const updatedBets = handBets.map((bet, idx) => (idx === activeHandIndex ? bet * WIN_PAYOUT_MULTIPLIER : bet));

    // Animate card being dealt
    setDeck(updatedDeck);
    setIsDealing(true);
    await sleep(DEAL_DELAY);
    setLastDealtId(next.card.instanceId);
    setHighlightedCardId(next.card.instanceId);
    setPlayerHands(updatedHands);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    setBalance((prev) => prev - currentBet); // Deduct additional bet
    setHandBets(updatedBets); // Double the bet for this hand
    setHasDoubled((prev) => prev.map((flag, idx) => (idx === activeHandIndex ? true : flag)));
    await waitForAnimation(next.card.instanceId);
    setHighlightedCardId(null);
    setIsDealing(false);

    // Check if doubled hand busted
    const total = handValue(doubledHand);
    if (total > BLACKJACK_TARGET) {
      setHandOutcomes((prev) =>
        prev.map((outcome, idx) => (idx === activeHandIndex ? "Bust" : outcome)),
      );
      setStatus("Doubled and busted.");
    } else {
      setStatus("Double complete. Standing on this hand.");
    }

    // Double always ends the hand (automatic stand)
    await moveToNextHand(updatedHands, updatedDeck, updatedBets);
  }, [
    activeHandIndex,
    balance,
    deck,
    handBets,
    hasDoubled,
    isDealing,
    moveToNextHand,
    playerHands,
    roundOver,
  ]);

  /**
   * Player action: Split (split a pair into two separate hands).
   * - Can be done on any hand with two cards of the same value (allows resplitting)
   * - Requires sufficient balance to place a second bet
   * - Splits the two cards into separate hands
   * - Deals one card to each new hand
   * - Player then plays each hand separately
   */
  const handleSplit = useCallback(async () => {
    const currentHand = playerHands[activeHandIndex];
    const currentBet = handBets[activeHandIndex] ?? 0;
    // Validate split conditions
    if (
      roundOver ||
      isDealing ||
      !currentHand ||
      currentHand.length !== BLACKJACK_HAND_LENGTH || // Must have exactly 2 cards
      currentHand[0].value !== currentHand[1].value || // Cards must have same value
      currentBet === 0 ||
      balance < currentBet // Need balance for second bet
    ) {
      return;
    }

    let workingDeck = deck;
    const [firstCard, secondCard] = currentHand;

    // Draw cards for both split hands
    const firstDraw = drawCard(workingDeck);
    workingDeck = firstDraw.rest;
    const secondDraw = drawCard(workingDeck);
    workingDeck = secondDraw.rest;

    // Create two separate hands from the split cards
    const newHand1 = [firstCard];
    const newHand2 = [secondCard];

    // Build new hands array: replace the split hand with two new hands
    const newHands = [...playerHands];
    newHands.splice(activeHandIndex, 1, newHand1, newHand2);

    // Build new bets array: insert bet for second hand
    const newBets = [...handBets];
    newBets.splice(activeHandIndex, 1, currentBet, currentBet);

    // Build new outcomes array: insert outcome for second hand
    const newOutcomes = [...handOutcomes];
    newOutcomes.splice(activeHandIndex, 1, null, null);

    // Build new hasDoubled array: insert flag for second hand
    const newHasDoubled = [...hasDoubled];
    newHasDoubled.splice(activeHandIndex, 1, false, false);

    // Update state for split
    setBalance((prev) => prev - currentBet); // Deduct bet for second hand
    setDeck(workingDeck);
    setHandBets(newBets);
    setHandOutcomes(newOutcomes);
    setHasDoubled(newHasDoubled);
    // Keep activeHandIndex the same (it now points to the first of the split hands)
    setStatus("Hands split! Play the first hand.");
    setPlayerHands(newHands.map((hand) => [...hand]));

    // Deal card to first hand with animation
    setIsDealing(true);
    await sleep(DEAL_DELAY);
    newHands[activeHandIndex] = [...newHands[activeHandIndex], firstDraw.card];
    setLastDealtId(firstDraw.card.instanceId);
    setHighlightedCardId(firstDraw.card.instanceId);
    setPlayerHands(newHands.map((hand) => [...hand]));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await waitForAnimation(firstDraw.card.instanceId);
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedCardId(null);
      highlightTimeoutRef.current = null;
    }, HIGHLIGHT_TIMEOUT_MS);

    // Deal card to second hand with animation
    await sleep(DEAL_DELAY);
    newHands[activeHandIndex + 1] = [...newHands[activeHandIndex + 1], secondDraw.card];
    setLastDealtId(secondDraw.card.instanceId);
    setHighlightedCardId(secondDraw.card.instanceId);
    setPlayerHands(newHands.map((hand) => [...hand]));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await waitForAnimation(secondDraw.card.instanceId);
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedCardId(null);
      highlightTimeoutRef.current = null;
    }, HIGHLIGHT_TIMEOUT_MS);
    setIsDealing(false);
  }, [activeHandIndex, balance, deck, handBets, hasDoubled, handOutcomes, isDealing, playerHands, roundOver]);

  // Computed values: Determine if actions are available
  const activeHand = playerHands[activeHandIndex];
  const canDouble =
    !roundOver &&
    !isDealing &&
    !!activeHand &&
    activeHand.length === BLACKJACK_HAND_LENGTH && // Must have exactly 2 cards
    hasDoubled[activeHandIndex] !== true && // Can't have already doubled
    (handBets[activeHandIndex] ?? 0) > 0 &&
    balance >= (handBets[activeHandIndex] ?? 0); // Need balance to double
  const canSplit =
    !roundOver &&
    !isDealing &&
    !!activeHand &&
    activeHand.length === BLACKJACK_HAND_LENGTH && // Must have exactly 2 cards
    activeHand[0].value === activeHand[1].value && // Cards must have same value
    (handBets[activeHandIndex] ?? 0) > 0 &&
    balance >= (handBets[activeHandIndex] ?? 0); // Need balance for second bet

  /**
   * Resets the game by resetting balance to starting amount and clearing all game state.
   */
  const resetGame = useCallback(() => {
    setBalance(STARTING_BALANCE);
    setBetAmount(MIN_BET);
    setPlayerHands([]);
    setHandBets([]);
    setHandOutcomes([]);
    setActiveHandIndex(0);
    setDealerHand([]);
    setStatus("Place your bet to begin.");
    setRoundOver(true);
    setIsDealing(false);
    setLastDealtId(null);
    setHighlightedCardId(null);
    setDealerHoleRevealed(false);
    setHasDoubled([]);
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }
  }, []);

  return {
    // State
    balance,
    betAmount,
    playerHands,
    handBets,
    activeHandIndex,
    handOutcomes,
    dealerHand,
    dealerTotal,
    playerTotals,
    status,
    roundOver,
    isDealing,
    lastDealtId,
    highlightedCardId,
    dealerHoleRevealed,
    canDouble,
    canSplit,
    // Actions
    setBetAmount,
    startRound,
    handleHit,
    handleStand,
    handleDouble,
    handleSplit,
    resetGame,
  };
};

