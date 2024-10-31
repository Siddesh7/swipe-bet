import React, { useEffect, useMemo, useState } from "react";
import TinderCard from "react-tinder-card";
import BetCard from "./bet-card";
import { useReadContract } from "wagmi";
import PREDICTION_MARKET_ABI from "../lib/abi.json";
import { PREDICTION_MARKET_ADDRESS } from "@/constants";
interface Market {
  id: string;
  creator: string;
  totalYesAmount: string | number;
  totalNoAmount: string | number;
  isResolved: boolean;
  bettingEndTime: any;
  resolutionTime: any;
  imageUri: string;
  question: string;
  outcome: string;
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

  const [markets, setMarkets] = useState<Market[]>([]);

  const {
    data: rawActivePredictions,
    isError: isActivePredictionsError,
    isLoading: isActivePredictionsLoading,
    refetch: refetchActive,
  } = useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: "getActivePredictions",
  }) as {
    data: unknown[] | undefined;
    isError: boolean;
    isLoading: boolean;
    refetch: () => void;
  };

  const placeBet = (side: boolean, betId: string) => {
    console.log(side, betId);

    //logic here
    
  };
  useEffect(() => {
    if (rawActivePredictions) {
      setMarkets(rawActivePredictions as any);
    }
  }, [rawActivePredictions]);

  const outOfFrame = (name) => {
    console.log(name + " left the screen!");
  };
  const childRefs = useMemo<any>(
    () =>
      Array(markets.length)
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
              description={market.question}
              winPercentage={
                (Number(market.totalYesAmount.toString()) /
                  Number(market.totalNoAmount.toString())) *
                100
              }
              losePercentage={
                (Number(market.totalNoAmount.toString()) /
                  Number(market.totalYesAmount.toString())) *
                100
              }
              imageUrl={market.imageUri}
              betTime={market.bettingEndTime}
              yesTotalAmount={Number(market.totalYesAmount.toString())}
              noTotalAmount={Number(market.totalNoAmount.toString())}
              onYesClick={async () => {
                if (childRefs[index].current) {
                  await childRefs[index].current.swipe("right");
                  placeBet(true, market.id);
                }
              }}
              onNoClick={async () => {
                if (childRefs[index].current) {
                  await childRefs[index].current.swipe("left");
                  placeBet(false, market.id);
                }
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
