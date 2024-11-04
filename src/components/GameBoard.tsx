import React, { useState } from "react";
import { Card as CardComponent } from "./Card";
import { PlayerHand } from "./PlayerHand";
import { GameState, Card, Suit } from "../types/game";
import { Trophy, Heart, Diamond, Club, Spade } from "lucide-react";

interface GameBoardProps {
  gameState: GameState;
  onPlayCard: (card: Card) => void;
  onPlaceBid: (bid: number) => void;
  onSelectTrump: (suit: Suit) => void;
}

export function GameBoard({
  gameState,
  onPlayCard,
  onPlaceBid,
  onSelectTrump,
}: GameBoardProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const getBidStatus = (playerId: string) => {
    const bid = gameState.bids[playerId];
    if (bid === null) return null;
    if (bid === "pass") return "Passed";
    return `Bid: ${bid}`;
  };

  const canPlayerBid = (playerId: string) => {
    return gameState.activePlayers.includes(playerId);
  };

  const getTrickPosition = (playedBy: number | undefined) => {
    if (playedBy === undefined) return "";
    const positions = {
      0: "translate(-50%, 50%)", // Bottom
      1: "translate(-100%, -50%)", // Left
      2: "translate(-50%, -150%)", // Top
      3: "translate(0%, -50%)", // Right
    };
    return positions[playedBy as keyof typeof positions];
  };

  const getCardRotation = (playedBy: number | undefined) => {
    if (playedBy === undefined) return "";
    const rotations = {
      0: "rotate(0deg)",
      1: "rotate(90deg)",
      2: "rotate(180deg)",
      3: "rotate(-90deg)",
    };
    return rotations[playedBy as keyof typeof rotations];
  };

  React.useEffect(() => {
    if (gameState.currentTrick.length === 4) {
      const timer = setTimeout(() => {
        gameState.currentTrick = [];
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentTrick]);

  const suitIcons = {
    hearts: Heart,
    diamonds: Diamond,
    clubs: Club,
    spades: Spade,
  };

  const suitColors = {
    hearts: "text-red-500",
    diamonds: "text-red-500",
    clubs: "text-gray-800",
    spades: "text-gray-800",
  };

  return (
    <div className="min-h-screen bg-emerald-800 flex flex-col">
      {/* Game Info */}
      <div className="bg-white/10 p-4 text-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">220 Card Game</h2>
            <p>Phase: {gameState.gamePhase}</p>
            {gameState.gamePhase === "bidding" && (
              <p>Current Bid: {gameState.currentBid}</p>
            )}
          </div>
          {gameState.trump && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Trump:</span>
              <span className="capitalize flex items-center gap-1">
                {gameState.trump}
                {React.createElement(suitIcons[gameState.trump], {
                  className: `w-6 h-6 ${suitColors[gameState.trump]}`,
                })}
              </span>
            </div>
          )}
          <div className="flex items-center gap-4">
            {Object.entries(gameState.scores).map(([playerId, score]) => (
              <div key={playerId} className="flex items-center gap-2">
                <span>
                  {gameState.players.find((p) => p.id === playerId)?.name}:
                </span>
                <span className="font-bold">{score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative">
        {/* Current Trick */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {gameState.currentTrick.map((card, index) => (
            <div
              key={`trick-${index}`}
              className="absolute"
              style={{
                left: "50%",
                top: "50%",
                transform: getTrickPosition(card.playedBy),
              }}
            >
              <div style={{ transform: getCardRotation(card.playedBy) }}>
                <CardComponent card={card} isPlayable={false} />
              </div>
            </div>
          ))}
        </div>

        {/* Players */}
        <div className="absolute inset-0">
          {gameState.players.map((player, index) => (
            <PlayerHand
              key={player.id}
              player={player}
              isCurrentPlayer={index === gameState.currentPlayer}
              position={
                ["bottom", "left", "top", "right"][index] as
                  | "bottom"
                  | "left"
                  | "top"
                  | "right"
              }
              onPlayCard={
                index === 0
                  ? (card) => {
                      setSelectedCard(card);
                      onPlayCard(card);
                    }
                  : undefined
              }
              selectedCard={selectedCard}
              bidStatus={getBidStatus(player.id)}
              canBid={canPlayerBid(player.id)}
            />
          ))}
        </div>

        {/* Trump Selection UI */}
        {gameState.gamePhase === "selectingTrump" &&
          gameState.currentPlayer === 0 && (
            <div className="absolute left-1/2 bottom-48 -translate-x-1/2">
              <div className="bg-black/50 p-6 rounded-lg backdrop-blur-sm">
                <h3 className="text-white text-xl font-bold mb-4 text-center">
                  Select Trump Suit
                </h3>
                <div className="flex gap-4">
                  {(["hearts", "diamonds", "clubs", "spades"] as Suit[]).map(
                    (suit) => {
                      const SuitIcon = suitIcons[suit];
                      return (
                        <button
                          key={suit}
                          onClick={() => onSelectTrump(suit)}
                          className={`
                        p-4 rounded-lg bg-white hover:bg-gray-100 transition-colors
                        flex flex-col items-center gap-2
                      `}
                        >
                          <SuitIcon className={`w-8 h-8 ${suitColors[suit]}`} />
                          <span
                            className={`capitalize font-medium ${suitColors[suit]}`}
                          >
                            {suit}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          )}

        {/* Bidding UI */}
        {gameState.gamePhase === "bidding" && (
          <div className="absolute left-1/2 bottom-48 -translate-x-1/2 w-full max-w-3xl">
            <div className="bg-black/50 p-4 backdrop-blur-sm rounded-lg">
              <div className="flex justify-center items-center gap-4 mb-4">
                {gameState.players.map((player) => (
                  <div
                    key={player.id}
                    className={`px-4 py-2 rounded-lg ${
                      gameState.currentPlayer ===
                      gameState.players.findIndex((p) => p.id === player.id)
                        ? "bg-yellow-400 text-gray-900"
                        : canPlayerBid(player.id)
                        ? "bg-white/10 text-white"
                        : "bg-gray-500/50 text-gray-300"
                    }`}
                  >
                    <div className="font-semibold">{player.name}</div>
                    <div className="text-sm">
                      {getBidStatus(player.id) ||
                        (canPlayerBid(player.id) ? "Waiting..." : "Passed")}
                    </div>
                  </div>
                ))}
              </div>
              {gameState.currentPlayer === 0 && canPlayerBid("p1") && (
                <div className="flex justify-center gap-2 flex-wrap">
                  {[80, 100, 120, 140, 160, 180, 200, 220].map((bid) => (
                    <button
                      key={bid}
                      onClick={() => onPlaceBid(bid)}
                      disabled={bid <= gameState.currentBid}
                      className={`
                        px-4 py-2 rounded-lg font-semibold transition-colors
                        ${
                          bid <= gameState.currentBid
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-yellow-400 hover:bg-yellow-500 text-gray-900"
                        }
                      `}
                    >
                      Bid {bid}
                    </button>
                  ))}
                  <button
                    onClick={() => onPlaceBid(0)}
                    className="px-4 py-2 rounded-lg font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors"
                  >
                    Pass
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Game Over State */}
        {gameState.gamePhase === "finished" && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 text-center">
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
              <div className="space-y-2">
                {Object.entries(gameState.scores)
                  .sort(([, a], [, b]) => b - a)
                  .map(([playerId, score], index) => (
                    <div
                      key={playerId}
                      className="flex items-center justify-center gap-2"
                    >
                      <span>{index + 1}.</span>
                      <span>
                        {gameState.players.find((p) => p.id === playerId)?.name}
                        :
                      </span>
                      <span className="font-bold">{score}</span>
                    </div>
                  ))}
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
