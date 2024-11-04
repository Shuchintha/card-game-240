import { Card, Rank, Suit } from '../types/game';

export const CARD_RANKS: Rank[] = ['A', 'K', 'Q', 'J', '10', '9', '8', '7'];
export const CARD_SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

export const CARD_POINTS: Record<Rank, number> = {
  'A': 15,
  'K': 10,
  'Q': 10,
  'J': 10,
  '10': 10,
  '9': 0,
  '8': 0,
  '7': 0
};

export function createDeck(): Card[] {
  const deck: Card[] = [];
  
  for (const suit of CARD_SUITS) {
    for (const rank of CARD_RANKS) {
      deck.push({
        suit,
        rank,
        points: CARD_POINTS[rank]
      });
    }
  }
  
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
}

export function isMarriage(cards: Card[]): boolean {
  if (cards.length !== 2) return false;
  const [card1, card2] = cards;
  return card1.suit === card2.suit && 
         ((card1.rank === 'K' && card2.rank === 'Q') || 
          (card1.rank === 'Q' && card2.rank === 'K'));
}

function compareCards(cardA: Card, cardB: Card, leadSuit: Suit, trump: Suit | null): number {
  // Returns 1 if cardA beats cardB, -1 if cardB beats cardA
  if (cardA.suit === cardB.suit) {
      // Same suit, compare ranks
      const rankA = CARD_RANKS.indexOf(cardA.rank);
      const rankB = CARD_RANKS.indexOf(cardB.rank);
      if (rankA < rankB) {
          return 1; // cardA beats cardB
      } else if (rankA > rankB) {
          return -1; // cardB beats cardA
      } else {
          return 0; // Same rank
      }
  } else {
      // Different suits
      if (cardA.suit === trump) return 1; // cardA is trump
      if (cardB.suit === trump) return -1; // cardB is trump
      if (cardA.suit === leadSuit) return 1; // cardA is lead suit
      if (cardB.suit === leadSuit) return -1; // cardB is lead suit
      // Neither card is trump or lead suit; the first card played wins
      return 1; // cardA beats cardB
  }
}

export function evaluateTrick(trick: Card[], leadSuit: Suit, trump: Suit | null): number {
  let winningCard = trick[0];
  let winningIndex: number = winningCard.playedBy ?? 0;

  for (let i = 1; i < trick.length; i++) {
      const card = trick[i];
      const comparison = compareCards(winningCard, card, leadSuit, trump);
      if (comparison === -1) {
          winningCard = card;
          winningIndex = card.playedBy ?? 0;
      }
  }

  return winningIndex;
}

export function calculateTrickPoints(trick: Card[]): number {
  return trick.reduce((sum, card) => sum + card.points, 0);
}

export function getValidPlays(hand: Card[], leadCard: Card | null): Card[] {
  if (!leadCard) return hand;

  const hasSuit = hand.some(card => card.suit === leadCard.suit);
  if (!hasSuit) return hand;

  return hand.filter(card => card.suit === leadCard.suit);
}