import {PREDICTION_MARKET_ADDRESS} from "@/constants";
import React, {useEffect, useState} from "react";
import {useAccount, useReadContract} from "wagmi";
import PREDICTION_MARKET_ABI from "../lib/abi.json";
import Image from "next/image";
import {Card, CardContent, CardTitle} from "./ui/card";
import {Clock, Trophy} from "lucide-react";
import {TimestampDisplay} from "./profile";

const CreatedBets = () => {
  const [userCreatedBets, setUserCreatedBets] = useState<any>();
  const {address} = useAccount();
  const {data: userBets, isError} = useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: "getUserCreatedPredictions",
    account: address,
    args: [address],
  });

  useEffect(() => {
    if (!isError) setUserCreatedBets(userBets);
  }, [userBets, isError]);
  return (
    <div>
      {userCreatedBets &&
        userCreatedBets?.map((bet: any) => (
          <CreatedBetCard key={bet.id} bet={bet} />
        ))}
    </div>
  );
};

const CreatedBetCard = ({bet}: {bet: any}) => {
  return (
    <Card className="mb-4 bg-black border-2 border-red-600 overflow-hidden">
      <div className="relative">
        <Image
          src={bet.imageUri}
          alt={bet.name}
          width={500}
          height={400}
          className="w-screen h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
          <CardTitle className="text-lg text-white">{bet.question}</CardTitle>
        </div>
      </div>
      <CardContent className="p-4">
        <p className="text-sm text-white mb-2">{bet.description}</p>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1">
            <Trophy className="text-yellow-500" size={16} />
            <span className="text-xs text-white">
              Pool: $
              {(Number(bet.totalYesAmount.toString()) +
                Number(bet.totalNoAmount.toString())) /
                1e6}
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center text-xs text-white">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <TimestampDisplay timestamp={bet.bettingEndTime.toString()} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default CreatedBets;
