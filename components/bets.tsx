import React, {useEffect, useMemo, useState} from "react";
import TinderCard from "react-tinder-card";
import BetCard from "./bet-card";
import {useAccount, useReadContract, useWriteContract} from "wagmi";
import PREDICTION_MARKET_ABI from "../lib/abi.json";
import {PREDICTION_MARKET_ADDRESS} from "@/constants";
import {privateKeyToAccount} from "viem/accounts";
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
  const [lastLocation, setLastLocation] = useState("");
  const [betAmount, setBetAmount] = useState(1);
  const swiped = (direction: string, market: Market) => {
    setLastLocation(direction);

    if (direction === "left") placeBet(false, market);
    if (direction === "right") placeBet(true, market);
  };

  const [markets, setMarkets] = useState<Market[]>([]);
  const {address} = useAccount();
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

  const {writeContractAsync} = useWriteContract();
  const placeBet = async (side: boolean, market: Market) => {
    if (!market) {
      return;
    }

    const hash = await writeContractAsync({
      abi: PREDICTION_MARKET_ABI,
      functionName: "placeBet",
      args: [market.id, side, betAmount * 10 ** 6, address],
      account: privateKeyToAccount(process.env.NEXT_PUBLIC_ADMIN_PK! as any),
      address: PREDICTION_MARKET_ADDRESS,
    });
  };
  useEffect(() => {
    if (rawActivePredictions) {
      setMarkets(rawActivePredictions as any);
    }
  }, [rawActivePredictions]);

  const childRefs = useMemo<any>(
    () =>
      Array(markets.length)
        .fill(0)
        .map((i) => React.createRef()),
    []
  );

  const calculatePercentages = (totalYesAmount: any, totalNoAmount: any) => {
    // Convert to numbers and handle possible string inputs
    const yesAmount = Number(totalYesAmount.toString());
    const noAmount = Number(totalNoAmount.toString());

    // Calculate total amount
    const totalAmount = yesAmount + noAmount;

    // If there are no bets, return 50-50 split
    if (totalAmount === 0) {
      return {
        yesPercentage: 50,
        noPercentage: 50,
      };
    }

    // Calculate percentages
    const yesPercentage = (yesAmount / totalAmount) * 100;
    const noPercentage = (noAmount / totalAmount) * 100;

    return {
      yesPercentage,
      noPercentage,
    };
  };

  // Usage:

  return (
    <div className="flex flex-wrap relative w-[90%] h-full m-auto">
      {markets.map((market, index) => {
        const {yesPercentage, noPercentage} = calculatePercentages(
          market.totalYesAmount,
          market.totalNoAmount
        );

        return (
          <TinderCard
            ref={childRefs[index]}
            className="absolute top-0 left-0 w-full"
            key={index}
            onSwipe={(dir) => swiped(dir, market)}
          >
            <BetCard
              betAmountInput={betAmount}
              setBetAmountInput={setBetAmount}
              id={Number(market.id)}
              description={market.question}
              winPercentage={yesPercentage}
              losePercentage={noPercentage}
              imageUrl={market.imageUri}
              betTime={market.bettingEndTime}
              yesTotalAmount={Number(market.totalYesAmount.toString()) / 1e6}
              noTotalAmount={Number(market.totalNoAmount.toString()) / 1e6}
              onYesClick={async () => {
                if (childRefs[index] && childRefs[index].current) {
                  await childRefs[index].current.swipe("right");
                }
              }}
              onNoClick={async () => {
                if (childRefs[index] && childRefs[index].current) {
                  await childRefs[index].current.swipe("left");
                }
              }}
              onPassClick={async () => {
                if (childRefs[index] && childRefs[index].current)
                  await childRefs[index].current.swipe("up");
              }}
            />
          </TinderCard>
        );
      })}

      {lastLocation && (
        <div className="absolute bottom-40 bg-slate-200 rounded-full px-4 py-2 text-black left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <h2 className="text-black">
            You bet {lastLocation === "right" ? "yes" : "no"}
          </h2>
        </div>
      )}
    </div>
  );
}

export default CardBets;
