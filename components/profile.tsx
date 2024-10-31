import React, { useEffect, useState } from "react";
import { useBalance, useAccount, useReadContract } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { useEnsName } from "wagmi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Deposit from "@/components/deposit";
import NewBet from "@/components/new-bet";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Flame, Clock, Trophy, Target, User } from "lucide-react";
import { base } from "wagmi/chains";
import { PREDICTION_MARKET_ADDRESS, USDC_ADDRESS } from "@/constants";
import PREDICTION_MARKET_ABI from "../lib/abi.json";
const dummyData = {
  level: 7,
  xp: 85,
  placedBets: [
    {
      id: 1,
      name: "Dogecoin Price Prediction",
      amount: 100,
      winOdds: 0.65,
      loseOdds: 0.35,
      timeRemaining: "2d 5h",
      potentialWin: 165,
    },
    {
      id: 2,
      name: "US Presidential Election",
      amount: 50,
      winOdds: 0.48,
      loseOdds: 0.52,
      timeRemaining: "30d 12h",
      potentialWin: 104,
    },
    {
      id: 3,
      name: "Ethereum Price Prediction",
      amount: 75,
      winOdds: 0.3,
      loseOdds: 0.7,
      timeRemaining: "60d",
      potentialWin: 225,
    },
    {
      id: 4,
      name: "Ethereum Price Prediction",
      amount: 75,
      winOdds: 0.3,
      loseOdds: 0.7,
      timeRemaining: "60d",
      potentialWin: 225,
    },
    {
      id: 5,
      name: "Ethereum Price Prediction",
      amount: 75,
      winOdds: 0.3,
      loseOdds: 0.7,
      timeRemaining: "60d",
      potentialWin: 225,
    },
  ],
  createdBets: [
    {
      id: 1,
      name: "BTC Price Prediction",
      description: "Predict the price of BTC in 2024",
      image:
        "https://cdn.pixabay.com/photo/2023/11/08/13/56/ai-generated-8374812_1280.jpg",
      timeRemaining: "600d",
      participants: 1500,
      totalPool: 50000,
    },
    {
      id: 2,
      name: "Next 100x meme coin",
      description: "Guess the next meme coin to reach 100x",
      image:
        "https://cdn.pixabay.com/photo/2023/11/08/13/56/ai-generated-8374812_1280.jpg",
      timeRemaining: "90d",
      participants: 500,
      totalPool: 10000,
    },
    {
      id: 3,
      name: "Sui Price Prediction",
      description: "Predict the price of Sui in 2024",
      image:
        "https://cdn.pixabay.com/photo/2023/11/08/13/56/ai-generated-8374812_1280.jpg",
      timeRemaining: "365d",
      participants: 2000,
      totalPool: 100000,
    },
    {
      id: 4,
      name: "Sui Price Prediction",
      description: "Predict the price of Sui in 2024",
      image:
        "https://cdn.pixabay.com/photo/2023/11/08/13/56/ai-generated-8374812_1280.jpg",
      timeRemaining: "365d",
      participants: 2000,
      totalPool: 100000,
    },
  ],
};

const PlacedBetCard = ({ bet }: { bet: any }) => (
  <Card className="mb-4 bg-black border-2 border-red-600 overflow-hidden">
    <div className="bg-red-600 p-2">
      <CardTitle className="text-lg text-white flex justify-between items-center">
        <span>{bet.name}</span>
        <Badge className="bg-white text-red-600">${bet.amount}</Badge>
      </CardTitle>
    </div>
    <CardContent className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Flame className="text-green-500" size={20} />
          <span className="text-sm text-white font-bold">
            {(bet.winOdds * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="text-yellow-500" size={20} />
          <span className="text-sm text-white font-bold">
            +${bet.potentialWin}
          </span>
        </div>
      </div>
      <Progress value={bet.winOdds * 100} className="h-2 mb-2" />
      <div className="flex justify-between items-center text-xs text-white">
        <span>Win Chance</span>
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{bet.timeRemaining}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const CreatedBetCard = ({ bet }: { bet: any }) => (
  <Card className="mb-4 bg-black border-2 border-red-600 overflow-hidden">
    <div className="relative">
      <img
        src={bet.image}
        alt={bet.name}
        className="w-screen h-full object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
        <CardTitle className="text-lg text-white">{bet.name}</CardTitle>
      </div>
    </div>
    <CardContent className="p-4">
      <p className="text-sm text-white mb-2">{bet.description}</p>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1">
          <Target className="text-blue-500" size={16} />
          <span className="text-xs text-white">
            {bet.participants} participants
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Trophy className="text-yellow-500" size={16} />
          <span className="text-xs text-white">Pool: ${bet.totalPool}</span>
        </div>
      </div>
      <div className="flex justify-between items-center text-xs text-white">
        <Badge className="bg-red-600 text-white">Created by you</Badge>
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{bet.timeRemaining}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const Profile = () => {
  const [activeTab, setActiveTab] = useState("placed");
  const [createdBets, setCreatedBets] = useState(dummyData.createdBets);
  const [userBalance, setUserBalance] = useState<any>();
  const { user } = usePrivy();
  const { address } = useAccount();
  const { data: ethBalance } = useBalance({
    address,
    chainId: base.id, // Base mainnet chain ID
  });
  const { data: contractBalance, refetch: refetchContractBalance } =
    useReadContract({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: "getBalance",
      account: address,
    });

  useEffect(() => {
    setUserBalance(contractBalance);
  }, [contractBalance]);
  const { data: ensName } = useEnsName({ address });

  const displayAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Not connected";

  const handleCreateBet = (betData: any) => {
    const newBet = {
      id: createdBets.length + 1,
      name: `${betData.outcome1} vs ${betData.outcome2}`,
      description: betData.description,
      image:
        betData.image ||
        "https://cdn.pixabay.com/photo/2023/11/08/13/56/ai-generated-8374812_1280.jpg",
      timeRemaining: "365d", // You might want to calculate this based on current time
      participants: 0,
      totalPool: 0,
    };
    setCreatedBets([newBet, ...createdBets]);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="bg-transparent text-white" size="icon">
          <User />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full h-full sm:max-w-md p-0 bg-black"
      >
        <SheetHeader className="text-white p-4">
          <SheetTitle className="text-xl font-bold">Betting Profile</SheetTitle>
        </SheetHeader>
        <div className="p-4 overflow-y-auto max-h-[calc(100vh-60px)]">
          <Card className="mb-6 bg-black border-2 border-red-600">
            <CardHeader>
              <CardTitle className="flex justify-between items-center text-white">
                <span>Wallet Info</span>
                <Badge className="bg-red-600 text-white">
                  Level {dummyData.level}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-2 text-white">
                Wallet: {displayAddress}
              </p>
              <p className="text-lg font-bold mb-4 text-white flex justify-between items-center">
                USDC Balance:{" "}
                {userBalance && `${Number(userBalance) / 1e6} USDC`}
                <Deposit />
              </p>

              <div className="flex items-center gap-2 mb-2">
                <Progress value={dummyData.xp} className="w-full bg-gray-800" />
                <span className="text-sm text-white">{dummyData.xp}%</span>
              </div>
              <p className="text-xs text-white">XP to next level</p>
            </CardContent>
          </Card>

          <Tabs
            defaultValue={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-black mb-4">
              <TabsTrigger
                value="placed"
                className="text-white data-[state=active]:bg-red-600 data-[state=active]:text-white"
              >
                Bets Placed
              </TabsTrigger>
              <TabsTrigger
                value="created"
                className="text-white data-[state=active]:bg-red-600 data-[state=active]:text-white"
              >
                Bets Created
              </TabsTrigger>
            </TabsList>
            <TabsContent value="placed">
              {dummyData.placedBets.map((bet) => (
                <PlacedBetCard key={bet.id} bet={bet} />
              ))}
            </TabsContent>
            <TabsContent
              value="created"
              className="h-auto max-h-[calc(100vh-450px)] overflow-y-auto pr-2"
            >
              <div className="flex justify-end mb-4">
                <NewBet />
              </div>
              {createdBets.map((bet) => (
                <CreatedBetCard key={bet.id} bet={bet} />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Profile;
