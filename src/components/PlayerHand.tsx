/* eslint-disable react/react-in-jsx-scope */
import { Card as CardComponent } from "./Card";
import { Card, Player } from "../types/game";

interface PlayerHandProps {
  player: Player;
  isCurrentPlayer: boolean;
  position: "bottom" | "left" | "top" | "right";
  onPlayCard?: (card: Card) => void;
  selectedCard?: Card | null;
  bidStatus?: string | null;
  canBid?: boolean;
}

export function PlayerHand({
  player,
  isCurrentPlayer,
  position,
  onPlayCard,
  selectedCard,
  bidStatus,
  canBid = true,
}: PlayerHandProps) {
  const containerClasses = {
    bottom: "bottom-4 left-1/2 -translate-x-1/2",
    left: "left-4 top-1/2 -translate-y-1/2",
    top: "top-4 left-1/2 -translate-x-1/2",
    right: "right-4 top-1/2 -translate-y-1/2",
  };

  const wrapperClasses = {
    bottom: "flex-row justify-center",
    left: "flex-col justify-center h-[32rem]",
    top: "flex-row justify-center",
    right: "flex-col justify-center h-[32rem]",
  };

  const cardContainerClasses = {
    bottom: "-ml-16 first:ml-0 hover:-translate-y-4 transition-transform",
    left: "-mt-28 first:mt-0 hover:-translate-x-4 transition-transform",
    top: "-ml-16 first:ml-0 hover:translate-y-4 transition-transform",
    right: "-mt-28 first:mt-0 hover:translate-x-4 transition-transform",
  };

  const nameWrapperClasses = {
    bottom: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    left: "left-full top-1/2 -translate-y-1/2 ml-6",
    top: "top-full left-1/2 -translate-x-1/2 mt-2",
    right: "right-full top-1/2 -translate-y-1/2 mr-6",
  };

  const cardRotationClasses = {
    bottom: "",
    left: "rotate-90",
    top: "rotate-180",
    right: "-rotate-90",
  };

  return (
    <div className={`absolute ${containerClasses[position]}`}>
      <div
        className={`
        relative p-4 rounded-lg
        ${
          position === "left" || position === "right"
            ? "h-[36rem]"
            : "w-[42rem]"
        }
      `}
      >
        <div className={`absolute ${nameWrapperClasses[position]}`}>
          <div
            className={`text-white text-center whitespace-nowrap bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm`}
          >
            <span
              className={`font-semibold ${
                isCurrentPlayer ? "text-yellow-400" : ""
              }`}
            >
              {player.name}
            </span>
            {bidStatus && (
              <div
                className={`text-sm ${canBid ? "opacity-80" : "text-gray-400"}`}
              >
                {bidStatus}
              </div>
            )}
          </div>
        </div>
        <div className={`flex ${wrapperClasses[position]}`}>
          {player.cards.map((card, index) => (
            <div
              key={index}
              style={{
                zIndex: index,
              }}
              className={`
                relative
                ${cardContainerClasses[position]}
              `}
            >
              <div className={cardRotationClasses[position]}>
                <CardComponent
                  card={
                    player.isBot
                      ? { suit: "spades", rank: "7", points: 0 }
                      : card
                  }
                  isPlayable={isCurrentPlayer && !player.isBot}
                  isSelected={!player.isBot && card === selectedCard}
                  onClick={() => {
                    if (isCurrentPlayer && !player.isBot && onPlayCard) {
                      onPlayCard(card);
                    }
                  }}
                  faceDown={player.isBot}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
