import React, {useEffect, useState} from "react";
import {useAccount, useReadContract} from "wagmi";

import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Card, CardContent, CardHeader} from "@/components/ui/card";

import {Button} from "@/components/ui/button";
import Balance from "@/components/balance";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {User} from "lucide-react";
import {PREDICTION_MARKET_ADDRESS, USDC_ADDRESS} from "@/constants";
import PREDICTION_MARKET_ABI from "../lib/abi.json";

import CreatedBets from "./created-bets";
import AllPlacedBets from "./all-placed-bets";

export const TimestampDisplay = ({timestamp}: {timestamp: string}) => {
  const date = new Date(parseInt(timestamp) * 1000);
  return (
    <span className="text-gray-700">
      {date.toLocaleDateString()} {date.toLocaleTimeString()}
    </span>
  );
};

const Profile = () => {
  const [activeTab, setActiveTab] = useState("placed");

  const [userBalance, setUserBalance] = useState<any>();

  const {address} = useAccount();

  const {data: contractBalance, refetch: refetchContractBalance} =
    useReadContract({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: "getBalance",
      account: address,
    });

  useEffect(() => {
    setUserBalance(contractBalance);
  }, [contractBalance]);

  const displayAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Not connected";

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
            <CardHeader></CardHeader>
            <CardContent>
              <p className="text-sm mb-2 text-white">
                Wallet: {displayAddress}
              </p>
              <p className="text-lg font-bold mb-4 text-white flex justify-between items-center">
                USDC Balance:{" "}
                {userBalance && `${Number(userBalance) / 1e6} USDC`}
                <Balance />
              </p>
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
              <AllPlacedBets />
            </TabsContent>
            <TabsContent
              value="created"
              className="h-auto max-h-[calc(100vh-450px)] overflow-y-auto pr-2"
            >
              <CreatedBets />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Profile;
