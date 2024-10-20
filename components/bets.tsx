import React, { useEffect, useMemo, useState } from "react";
import TinderCard from "react-tinder-card";
import BetCard from "./bet-card";
import { useReadContract } from "wagmi";
import predictionMarketABI from "../lib/abi.json";
import { formatEther, hexToString } from "viem";

interface Market {
  resolved: boolean;
  assertedOutcomeId: `0x${string}`;
  outcome1Token: `0x${string}`;
  outcome2Token: `0x${string}`;
  reward: bigint;
  requiredBond: bigint;
  outcome1: `0x${string}`;
  outcome2: `0x${string}`;
  description: `0x${string}`;
  imageString: string;
}

interface FormattedMarket
  extends Omit<Market, "outcome1" | "outcome2" | "description" | "reward"> {
  id: `0x${string}`;
  outcome1: string;
  outcome2: string;
  description: string;
  reward: string;
}

function CardBets() {
  const [wagerAllowance, setWagerAllowance] = useState(500);
  const [showCreateBetCard, setShowCreateBetCard] = useState(false);
  const [lastLocation, setLastLocation] = useState("");
  const swiped = (direction, nameToDelete) => {
    console.log("removing: " + nameToDelete);
    setLastLocation(direction);
    if (direction === "right") setWagerAllowance((prev) => prev - 100);
  };

  const [markets, setMarkets] = useState<FormattedMarket[]>([]);

  const { data, isError, isLoading } = useReadContract({
    address: process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS as `0x${string}`,
    abi: predictionMarketABI.abi,
    functionName: "getAllMarkets",
  });

  console.log(data);
  useEffect(() => {
    if (data) {
      const [marketIds, marketDetails] = data as any;
      const formattedMarkets: FormattedMarket[] = marketIds.map((id, index) => {
        const market = marketDetails[index];
        return {
          id,
          ...market,
          outcome1: hexToString(market.outcome1),
          outcome2: hexToString(market.outcome2),
          description: hexToString(market.description),
          reward: formatEther(market.reward),
          imageString: market.imageString,
        };
      });
      setMarkets(formattedMarkets);
    }
  }, [data]);

  const outOfFrame = (name) => {
    console.log(name + " left the screen!");
  };
  const betsHardCoded = [
    // {
    //   id: 1,
    //   name: "Bitcoin Price Bet",
    //   description:
    //     "Will Bitcoin be above $50,000 by the end of the month? I speculate it to reach more than that in a month. So, I am betting on it.",
    //   winPercentage: 60,
    //   losePercentage: 40,
    //   imageUrl:
    //     "https://cdn.pixabay.com/photo/2023/11/08/13/56/ai-generated-8374812_1280.jpg",
    //   betTime: "24h",
    //   yesTotalAmount: 1000,
    //   noTotalAmount: 500,
    // },
    // {
    //   id: 2,
    //   name: "Ethereum Price Bet",
    //   description: "Will Ethereum be above $3,000 by the end of the month?",
    //   winPercentage: 40,
    //   losePercentage: 60,
    //   imageUrl:
    //     "https://cdn.pixabay.com/photo/2023/11/08/13/56/ai-generated-8374812_1280.jpg",
    //   betTime: "24h",
    //   yesTotalAmount: 500,
    //   noTotalAmount: 1000,
    // },
    // {
    //   id: 3,
    //   name: "Dogecoin Price Bet",
    //   description: "Will Dogecoin be above $1 by the end of the month?",
    //   winPercentage: 80,
    //   losePercentage: 20,
    //   imageUrl:
    //     "https://cdn.pixabay.com/photo/2023/11/08/13/56/ai-generated-8374812_1280.jpg",
    //   betTime: "24h",
    //   yesTotalAmount: 2000,
    //   noTotalAmount: 100,
    // },
  ];

  const childRefs = useMemo<any>(
    () =>
      Array(betsHardCoded.length)
        .fill(0)
        .map((i) => React.createRef()),
    []
  );
  return (
    <div className="flex flex-wrap relative w-[90%] h-full m-auto">
      {markets.map((market, index) => {
        return (
          <TinderCard
            ref={childRefs[index]}
            className="absolute top-0 left-0 w-full"
            key={index}
            onSwipe={(dir) => swiped(dir, index)}
            onCardLeftScreen={() => outOfFrame(index)}
          >
            <BetCard
              id={Number(market.id)}
              description={market.description}
              winPercentage={50} // You might want to calculate this based on the market data
              losePercentage={50} // You might want to calculate this based on the market data
              imageUrl={market.imageString}
              betTime="24h" // You might want to derive this from the market data
              yesTotalAmount={0} // This might need adjustment based on your data structure
              noTotalAmount={0}
              onYesClick={async () => {
                if (childRefs[index].current)
                  await childRefs[index].current.swipe("right");
              }}
              onNoClick={async () => {
                if (childRefs[index].current)
                  await childRefs[index].current.swipe("left");
              }}
              onPassClick={async () => {
                if (childRefs[index].current)
                  await childRefs[index].current.swipe("up");
              }}
            />
          </TinderCard>
        );
      })}

      {lastLocation && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <h2 className="text-white">You swiped {lastLocation}</h2>
        </div>
      )}
    </div>
  );
}

export default CardBets;
