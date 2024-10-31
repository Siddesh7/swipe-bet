import {PREDICTION_MARKET_ADDRESS} from "@/constants";
import React, {useEffect, useState} from "react";
import {useAccount, useReadContract} from "wagmi";
import PREDICTION_MARKET_ABI from "../lib/abi.json";
import {Card, CardContent, CardTitle} from "./ui/card";
import {Badge} from "./ui/badge";
import {Clock, Flame} from "lucide-react";
import {Progress} from "@radix-ui/react-progress";
import {TimestampDisplay} from "./profile";
const AllPlacedBets = () => {
  const [userBets, setUserBets] = useState<any>();
  const {address} = useAccount();
  const {data: myBets} = useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: "getUserBets",
    account: address,
    args: [address],
  });

  useEffect(() => {
    if (myBets) setUserBets(myBets);
  }, [myBets]);
  return (
    <div>
      {userBets &&
        userBets[0]?.map((bet: any, index: number) => (
          <PlacedBetCard key={bet.id} bet={bet} value={userBets[1][index]} />
        ))}
    </div>
  );
};
const PlacedBetCard = ({bet, value}: {bet: any; value: any}) => {
  const winOdds =
    bet.totalYesAmount.toString() /
    (bet.totalYesAmount.toString() + bet.totalNoAmount.toString());
  return (
    <Card className="mb-4 bg-black border-2 border-red-600 overflow-hidden">
      <div className="bg-red-600 p-2">
        <CardTitle className="text-lg text-white flex justify-between items-center">
          <span>{bet.question}</span>
          <div className="flex flex-row gap-2">
            <Badge className="bg-white text-red-600">
              ${Number(value.amount.toString()) / 1e6}
            </Badge>{" "}
            <Badge className="bg-white text-red-600">
              {value.choice === true ? "Yes" : "No"}
            </Badge>
          </div>
        </CardTitle>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Flame className="text-green-500" size={20} />
            <span className="text-sm text-white font-bold">
              {winOdds * 1000}%
            </span>
          </div>
        </div>
        <Progress value={winOdds * 1000} className="h-2 mb-2" />
        <div className="flex justify-between items-center text-xs text-white">
          <span>Win Chance</span>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <TimestampDisplay timestamp={bet.bettingEndTime.toString()} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default AllPlacedBets;
