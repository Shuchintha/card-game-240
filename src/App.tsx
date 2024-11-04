import React, { useState, useEffect } from "react";
import { GameBoard } from "./components/GameBoard";
import { Card, GameState, Player, Suit } from "./types/game";
import {
  createDeck,
  shuffleDeck,
  evaluateTrick,
  calculateTrickPoints,
  getValidPlays,
} from "./utils/cardUtils";

const INITIAL_GAME_STATE: GameState = {
  players: [
    { id: "p1", name: "You", cards: [], isBot: false },
    { id: "p2", name: "Bot 1", cards: [], isBot: true },
    { id: "p3", name: "Bot 2", cards: [], isBot: true },
    { id: "p4", name: "Bot 3", cards: [], isBot: true },
  ],
  currentPlayer: 0,
  trump: null,
  currentBid: 60,
  bidWinner: null,
  marriages: [],
  tricks: [],
  currentTrick: [],
  scores: { p1: 0, p2: 0, p3: 0, p4: 0 },
  gamePhase: "dealing",
  passCount: 0,
  bids: { p1: null, p2: null, p3: null, p4: null },
  activePlayers: ["p1", "p2", "p3", "p4"],
};

function App() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);

  React.useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    if (gameState.players[gameState.currentPlayer].isBot) {
      if (gameState.gamePhase === "bidding") {
        handleBotBid();
      } else if (gameState.gamePhase === "playing") {
        handleBotPlay();
      }
    }
  }, [gameState.currentPlayer, gameState.gamePhase]);

  function startNewGame() {
    const deck = shuffleDeck(createDeck());
    const newGameState = { ...INITIAL_GAME_STATE };
    const sortPlayers = (playerCards: Card[]) => {
      return playerCards.sort((a, b) => {
        const suitOrder = ["hearts", "clubs", "diamonds", "spades"];
        const rankOrder = ["A", "K", "Q", "J", "10", "9", "8", "7"];

        if (a.suit === b.suit) {
          return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
        } else {
          return suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
        }
      });
    };
    // Deal initial 8 cards to each player
    newGameState.players = newGameState.players.map((player) => ({
      ...player,
      cards: sortPlayers(deck.splice(0, 8)),
    }));

    newGameState.gamePhase = "bidding";
    setGameState(newGameState);
  }

  function handleBotBid() {
    setTimeout(() => {
      const currentBid = gameState.currentBid;
      const botCards = gameState.players[gameState.currentPlayer].cards;
      const totalPoints = botCards.reduce((sum, card) => sum + card.points, 0);
      const shouldBid = Math.random() > 0.5 && totalPoints > 20;

      if (shouldBid && currentBid < 200) {
        const newBid = currentBid + 20;
        handlePlaceBid(newBid);
      } else {
        handlePlaceBid(0);
      }
    }, 1000);
  }

  function handleBotPlay() {
    setTimeout(() => {
      const currentPlayer = gameState.players[gameState.currentPlayer];
      const validPlays = getValidPlays(
        currentPlayer.cards,
        gameState.currentTrick[0]
      );

      if (validPlays.length > 0) {
        handlePlayCard(validPlays[0]);
      }
    }, 1000);
  }

  function startPlayingPhase(state: GameState, lastBidder: number) {
    state.gamePhase = "selectingTrump";
    state.bidWinner = lastBidder;
    state.currentPlayer = lastBidder;

    // If bot is the winner, automatically select trump
    if (state.players[lastBidder].isBot) {
      const botCards = state.players[lastBidder].cards;
      // Find the suit with the most high-value cards
      const suitStrengths = botCards.reduce((acc, card) => {
        acc[card.suit] = (acc[card.suit] || 0) + card.points;
        return acc;
      }, {} as Record<Suit, number>);

      const strongestSuit = Object.entries(suitStrengths).reduce((a, b) =>
        b[1] > a[1] ? b : a
      )[0] as Suit;

      state.trump = strongestSuit;
      state.gamePhase = "playing";
    }

    return state;
  }

  function handleSelectTrump(suit: Suit) {
    setGameState((prevState) => {
      const newState = { ...prevState };
      newState.trump = suit;
      newState.gamePhase = "playing";
      return newState;
    });
  }

  function handlePlayCard(card: Card) {
    if (gameState.gamePhase !== "playing") return;

    setGameState((prevState) => {
      const newState = JSON.parse(JSON.stringify(prevState));
      const currentPlayer = newState.players[newState.currentPlayer];
      const validPlays = getValidPlays(
        currentPlayer.cards,
        newState.currentTrick[0]
      );
      if (!isValidPlay(validPlays, card)) {
        return prevState;
      }
      removeCardFromHand(currentPlayer, card);
      addCardToCurrentTrick(newState, card);

      if (isTrickComplete(newState.currentTrick)) {
        processCompletedTrick(newState);
      } else {
        advanceToNextPlayer(newState);
      }

      return newState;
    });
  }

  // Helper Functions
  function isValidPlay(validPlays: Card[], card: Card): boolean {
    return validPlays.some((c) => c.suit === card.suit && c.rank === card.rank);
  }

  function removeCardFromHand(player: Player, card: Card) {
    player.cards = player.cards.filter(
      (c) => !(c.suit === card.suit && c.rank === card.rank)
    );
  }

  function addCardToCurrentTrick(gameState: GameState, card: Card) {
    const playedCard = { ...card, playedBy: gameState.currentPlayer };
    gameState.currentTrick = [...gameState.currentTrick, playedCard];
  }

  function isTrickComplete(currentTrick: Card[]): boolean {
    return currentTrick.length === 4;
  }

  function processCompletedTrick(gameState: GameState) {
    const leadSuit = gameState.currentTrick[0].suit;
    const winnerIndex = evaluateTrick(
      gameState.currentTrick,
      leadSuit,
      gameState.trump
    );
    const trickPoints = calculateTrickPoints(gameState.currentTrick);

    updateScores(gameState, winnerIndex, trickPoints);
    moveTrickToCompleted(gameState);
    setNextPlayer(gameState, winnerIndex);
    checkGameOver(gameState);
  }

  function updateScores(
    gameState: GameState,
    winnerIndex: number,
    trickPoints: number
  ) {
    const winnerId = gameState.players[winnerIndex].id;
    gameState.scores[winnerId] += trickPoints;
  }

  function moveTrickToCompleted(gameState: GameState) {
    gameState.tricks.push([...gameState.currentTrick]);
    // gameState.currentTrick = [];
  }

  function setNextPlayer(gameState: GameState, winnerIndex: number) {
    gameState.currentPlayer = winnerIndex;
  }

  function checkGameOver(gameState: GameState) {
    if (gameState.tricks.length === 8) {
      gameState.gamePhase = "finished";
    }
  }

  function advanceToNextPlayer(gameState: GameState) {
    gameState.currentPlayer = (gameState.currentPlayer + 1) % 4;
  }

  function handlePlaceBid(bid: number) {
    if (gameState.gamePhase !== "bidding") return;

    setGameState((prevState) => {
      const newState = JSON.parse(JSON.stringify(prevState));
      const currentPlayerId = newState.players[newState.currentPlayer].id;

      if (!newState.activePlayers.includes(currentPlayerId)) {
        return prevState;
      }

      if (bid === 0) {
        newState.passCount = newState.passCount + 1;
        newState.bids[currentPlayerId] = "pass";
        newState.activePlayers = newState.activePlayers.filter(
          (id: string) => id !== currentPlayerId
        );

        let nextPlayer = (newState.currentPlayer + 1) % 4;
        while (
          !newState.activePlayers.includes(newState.players[nextPlayer].id)
        ) {
          nextPlayer = (nextPlayer + 1) % 4;
        }
        newState.currentPlayer = nextPlayer;

        if (newState.passCount === 3) {
          const lastBidder = newState.bidWinner ?? newState.currentPlayer;
          return startPlayingPhase(newState, lastBidder);
        }
      } else {
        newState.currentBid = bid;
        newState.bidWinner = newState.currentPlayer;
        newState.bids[currentPlayerId] = bid;

        let nextPlayer = (newState.currentPlayer + 1) % 4;
        while (
          !newState.activePlayers.includes(newState.players[nextPlayer].id)
        ) {
          nextPlayer = (nextPlayer + 1) % 4;
        }
        newState.currentPlayer = nextPlayer;
      }
      return newState;
    });
  }

  return (
    <GameBoard
      gameState={gameState}
      onPlayCard={handlePlayCard}
      onPlaceBid={handlePlaceBid}
      onSelectTrump={handleSelectTrump}
    />
  );
}

export default App;
