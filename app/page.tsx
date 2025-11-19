"use client";

import { useBlackjackGame } from "./hooks/useBlackjackGame";
import { BettingControls } from "./components/BettingControls";
import { DealerSection } from "./components/DealerSection";
import { PlayerSection } from "./components/PlayerSection";
import { GameControls } from "./components/GameControls";
import { MIN_BET, MAX_BET, BET_STEP } from "./constants";

export default function Home() {
  const {
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
    setBetAmount,
    startRound,
    handleHit,
    handleStand,
    handleDouble,
    handleSplit,
    resetGame,
  } = useBlackjackGame();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-900 via-emerald-950 to-black px-4 py-12 text-white">
      <main className="w-full max-w-4xl rounded-3xl border border-emerald-700/40 bg-emerald-950/70 p-8 shadow-2xl shadow-black/40 backdrop-blur">
        <header className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Jason Kim</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white">1v1 Blackjack</h1>
          <p className="mt-2 text-emerald-100">{status}</p>
        </header>

        <BettingControls
          balance={balance}
          betAmount={betAmount}
          onBetAmountChange={setBetAmount}
          onDeal={startRound}
          onStartOver={resetGame}
          roundOver={roundOver}
          isDealing={isDealing}
        />

        <section className="grid gap-8 md:grid-cols-2">
          <DealerSection
            dealerHand={dealerHand}
            dealerTotal={dealerTotal}
            roundOver={roundOver}
            dealerHoleRevealed={dealerHoleRevealed}
            lastDealtId={lastDealtId}
            highlightedCardId={highlightedCardId}
          />

          <PlayerSection
            playerHands={playerHands}
            playerTotals={playerTotals}
            handBets={handBets}
            handOutcomes={handOutcomes}
            activeHandIndex={activeHandIndex}
            roundOver={roundOver}
            isDealing={isDealing}
            dealerHoleRevealed={dealerHoleRevealed}
            lastDealtId={lastDealtId}
            highlightedCardId={highlightedCardId}
          />
        </section>

        <GameControls
          onHit={handleHit}
          onStand={handleStand}
          onDouble={handleDouble}
          onSplit={handleSplit}
          roundOver={roundOver}
          isDealing={isDealing}
          canDouble={canDouble}
          canSplit={canSplit}
        />

        <p className="mt-6 text-center text-sm text-emerald-300">
          One deck, shuffled between each round. Bets: ${MIN_BET} min / ${MAX_BET} max, ${BET_STEP} increments.
          Blackjacks pay 2:1.
        </p>
      </main>
    </div>
  );
}
