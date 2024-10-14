import React, {useState} from "react";
import {motion} from "framer-motion";
import {Plus, Minus, TrendingUp, TrendingDown, Check, X} from "lucide-react";
import {Button} from "./ui/button";

interface BetCardProps {
  id: number;
  name: string;
  description: string;
  winPercentage: number;
  losePercentage: number;
  imageUrl: string;
  betTime: string;
  yesTotalAmount: number;
  noTotalAmount: number;
  onYesClick: () => void;
  onNoClick: () => void;
  onPassClick: () => void;
}

const BetCard: React.FC<BetCardProps> = ({
  name,
  description,
  winPercentage,
  losePercentage,
  imageUrl,
  betTime,
  yesTotalAmount,
  noTotalAmount,
  onYesClick,
  onNoClick,
  onPassClick,
}) => {
  const [betAmount, setBetAmount] = useState(1);

  const handleIncreaseBet = () => setBetAmount((prev) => prev + 1);
  const handleDecreaseBet = () => setBetAmount((prev) => Math.max(1, prev - 1));

  return (
    <div className="w-full max-w-sm mx-auto h-[calc(100vh-4rem)] bg-black text-white rounded-xl shadow-lg overflow-hidden">
      <div className="relative h-1/3 w-full">
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
          <div className="flex flex-col justify-center items-center">
            <div className="flex items-center">
              <TrendingDown className="text-red-500 mr-2" size={20} />
              <p className="text-red-500 text-center font-semibold">
                {losePercentage}%
              </p>
            </div>
            <span className="text-red-500">${noTotalAmount}</span>
          </div>
          <div className="flex flex-col justify-center items-center">
            <div className="flex items-center">
              <TrendingUp className="text-green-500 mr-2" size={20} />
              <p className="text-green-500 text-center font-semibold">
                {winPercentage}%
              </p>
            </div>
            <span className="text-green-500 text-center">
              ${yesTotalAmount}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 bg-gray-800 rounded-lg overflow-hidden p-2">
          <button
            onClick={handleDecreaseBet}
            className="bg-red-600 p-2 text-white rounded-lg"
          >
            <Minus size={20} color="white" />
          </button>
          <div className="flex flex-row gap-0 bg-gray-800 rounded-lg overflow-hidden">
            <span className="text-white">$</span>
            <input
              type="number"
              value={betAmount}
              onChange={(e) =>
                setBetAmount(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-16 text-center bg-gray-800 text-white"
            />
          </div>
          <button
            onClick={handleIncreaseBet}
            className="bg-red-600 p-2 text-white rounded-lg"
          >
            <Plus size={20} color="white" />
          </button>
        </div>
        <div className="flex justify-around mt-4">
          <Button
            variant={"outline"}
            className="rounded-full bg-red-500 text-white flex flex-row gap-1 hover:bg-red-400"
            onClick={onNoClick}
          >
            <X size={24} />
            <span>Bet No</span>
          </Button>
          <Button
            variant={"outline"}
            onClick={onPassClick}
            className="rounded-full bg-yellow-300  text-yellow-600 hover:bg-yellow-400 "
          >
            Pass
          </Button>
          <Button
            variant={"outline"}
            onClick={onYesClick}
            className="rounded-full bg-green-500 text-white flex flex-row gap-1 hover:bg-green-400"
          >
            <Check size={24} />
            <span>Bet Yes</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BetCard;
