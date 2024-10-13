import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus, TrendingUp, TrendingDown, Check, X } from "lucide-react";

interface BetCardProps {
  id: number;
  name: string;
  description: string;
  winPercentage: number;
  losePercentage: number;
  imageUrl: string;
  betTime: string;
}

const BetCard: React.FC<BetCardProps> = ({
  name,
  description,
  winPercentage,
  losePercentage,
  imageUrl,
  betTime,
}) => {
  const [betAmount, setBetAmount] = useState(1);

  const handleIncreaseBet = () => setBetAmount((prev) => prev + 1);
  const handleDecreaseBet = () => setBetAmount((prev) => Math.max(1, prev - 1));

  return (
    <div className="w-full max-w-sm mx-auto h-[calc(100vh-4rem)] bg-black text-white rounded-xl shadow-lg overflow-hidden">
      <div className="relative h-1/2 w-full">
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black to-transparent" />
        <div className="absolute bottom-4 left-4 flex items-center">
          <h2 className="text-2xl font-bold mr-2">{name}</h2>
          <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
            {betTime}
          </span>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <p className="text-gray-300">{description}</p>
        <div className="flex justify-between">
          <div className="flex items-center">
            <TrendingDown className="text-red-500 mr-2" size={20} />
            <p className="text-red-500 text-center font-semibold">
              {losePercentage}%
            </p>
          </div>
          <div className="flex items-center">
            <TrendingUp className="text-green-500 mr-2" size={20} />
            <p className="text-green-500 text-center font-semibold">
              {winPercentage}%
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 bg-gray-800 rounded-lg overflow-hidden">
          <button
            onClick={handleDecreaseBet}
            className="bg-red-600 p-2 text-white"
          >
            <Minus size={20} />
          </button>
          <input
            type="number"
            value={betAmount}
            onChange={(e) =>
              setBetAmount(Math.max(1, parseInt(e.target.value) || 1))
            }
            className="w-20 text-center bg-gray-800 text-white"
          />
          <button
            onClick={handleIncreaseBet}
            className="bg-red-600 p-2 text-white"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="flex justify-around mt-4">
          <button className="group relative p-3 rounded-full bg-red-500 text-white transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-lg hover:shadow-red-500/50 focus:outline-none">
            <X size={24} />
            <span className="absolute inset-0 w-full h-full rounded-full bg-white opacity-0 group-hover:opacity-25 transition-opacity duration-300 ease-in-out"></span>
          </button>
          <button className="group relative p-3 rounded-full bg-green-500 text-white transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-lg hover:shadow-green-500/50 focus:outline-none">
            <Check size={24} />
            <span className="absolute inset-0 w-full h-full rounded-full bg-white opacity-0 group-hover:opacity-25 transition-opacity duration-300 ease-in-out"></span>
          </button>
        </div>
      </div>
    </div>
  );
};

const CardBets: React.FC = () => {
  const [lastLocation, setLastLocation] = useState("");

  const swiped = (direction: string, nameToDelete: string) => {
    console.log("removing: " + nameToDelete);
    setLastLocation(direction);
  };

  const outOfFrame = (name: string) => {
    console.log(name + " left the screen!");
  };

  const betsHardCoded: BetCardProps[] = [
    {
      id: 1,
      name: "Bitcoin Price Bet",
      description: "Will Bitcoin be above $50,000 by the end of the month?",
      winPercentage: 60,
      losePercentage: 40,
      imageUrl:
        "https://cdn.pixabay.com/photo/2023/11/08/13/56/ai-generated-8374812_1280.jpg",
      betTime: "24h",
    },
    // Add more bets as needed
  ];

  return (
    <div className="flex flex-wrap relative w-[96%] h-full m-auto">
      {betsHardCoded.map((bet) => (
        <motion.div
          key={bet.id}
          className="absolute top-0 left-0 w-full"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);
            if (swipe < -swipeConfidenceThreshold) {
              swiped("left", bet.id.toString());
            } else if (swipe > swipeConfidenceThreshold) {
              swiped("right", bet.id.toString());
            }
          }}
          onDragStart={() => outOfFrame(bet.id.toString())}
        >
          <BetCard {...bet} />
        </motion.div>
      ))}
    </div>
  );
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export default CardBets;
