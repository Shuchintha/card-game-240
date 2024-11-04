export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | 'K' | 'Q' | 'J' | '10' | '9' | '8' | '7';

export interface Card {
  suit: Suit;
  rank: Rank;
  points: number;
  playedBy?: number;
}

export interface Player {
  id: string;
  name: string;
  cards: Card[];
  isBot: boolean;
}

export interface Marriage {
  suit: Suit;
  shown: boolean;
}

export interface GameState {
  players: Player[];
  currentPlayer: number;
  trump: Suit | null;
  currentBid: number;
  bidWinner: number | null;
  marriages: Marriage[];
  tricks: Card[][];
  currentTrick: Card[];
  scores: Record<string, number>;
  gamePhase: 'dealing' | 'bidding' | 'selectingTrump' | 'playing' | 'finished';
  passCount: number;
  bids: Record<string, number | 'pass' | null>;
  activePlayers: string[];
}