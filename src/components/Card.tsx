/* eslint-disable react/react-in-jsx-scope */
import { Card as CardType } from "../types/game";
import { Heart, Diamond, Club, Spade } from "lucide-react";

interface CardProps {
  card: CardType;
  onClick?: () => void;
  isPlayable?: boolean;
  isSelected?: boolean;
  faceDown?: boolean;
}

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

export function Card({
  card,
  onClick,
  isPlayable = true,
  isSelected = false,
  faceDown = false,
}: CardProps) {
  const SuitIcon = suitIcons[card.suit];
  const suitColor = suitColors[card.suit];

  return (
    <div
      onClick={isPlayable ? onClick : undefined}
      className={`
        relative w-28 h-40 rounded-xl shadow-lg 
        transition-all duration-200 ease-in-out
        ${isPlayable ? "cursor-pointer hover:shadow-xl" : "cursor-default"}
        ${isSelected ? "ring-2 ring-blue-500 shadow-xl" : ""}
        ${faceDown ? "bg-emerald-700 border-2 border-emerald-600" : "bg-white"}
      `}
    >
      {!faceDown && (
        <>
          <div className="absolute top-2 left-2 flex flex-col items-center">
            <span className={`font-bold text-lg ${suitColor}`}>
              {card.rank}
            </span>
            <SuitIcon className={`w-4 h-4 ${suitColor}`} />
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <SuitIcon className={`w-10 h-10 ${suitColor}`} />
          </div>

          <div className="absolute bottom-2 right-2 flex flex-col items-center rotate-180">
            <span className={`font-bold text-lg ${suitColor}`}>
              {card.rank}
            </span>
            <SuitIcon className={`w-4 h-4 ${suitColor}`} />
          </div>
        </>
      )}
      {faceDown && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-emerald-600 rounded-full" />
        </div>
      )}
    </div>
  );
}
