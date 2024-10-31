"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

import predictionMarketABI from "../../lib/abi.json";
interface Market {
  marketId: string;
  outcome1: string;
  outcome2: string;
  description: string;
  resolved: boolean;
}

interface NewMarket {
  outcome1: string;
  outcome2: string;
  description: string;
  reward: string;
  requiredBond: string;
}

export default function PredictionMarkets() {
  const { address } = useAccount();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [newMarket, setNewMarket] = useState<NewMarket>({
    outcome1: "",
    outcome2: "",
    description: "",
    reward: "",
    requiredBond: "",
  });

  const { data: allMarkets, refetch: refetchMarkets } = useReadContract({
    address: process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS as `0x${string}`,
    abi: predictionMarketABI.abi,
    functionName: "getAllMarkets",
  });

  useEffect(() => {
    if (allMarkets) {
      setMarkets(allMarkets[1] as Market[]);
    }
  }, [allMarkets]);

  const { writeContractAsync: initializeMarket, data: initializeData } =
    useWriteContract();

  const { isLoading: isInitializing, isSuccess: isInitialized } =
    useWaitForTransactionReceipt({
      hash: initializeData?.hash,
    });

  const handleInitializeMarket = async () => {
    try {
      await initializeMarket({
        address: process.env
          .NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS as `0x${string}`,
        abi: predictionMarketABI.abi,
        functionName: "initializeMarket",
        args: [
          newMarket.outcome1,
          newMarket.outcome2,
          newMarket.description,
          parseEther(newMarket.reward),
          parseEther(newMarket.requiredBond),
        ],
      });
    } catch (error) {
      console.error("Failed to initialize market:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMarket({ ...newMarket, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (isInitialized) {
      refetchMarkets();
      setNewMarket({
        outcome1: "",
        outcome2: "",
        description: "",
        reward: "",
        requiredBond: "",
      });
    }
  }, [isInitialized, refetchMarkets]);

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New Market</CardTitle>
          <CardDescription>Initialize a new prediction market</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Input
              name="outcome1"
              placeholder="Outcome 1"
              onChange={handleInputChange}
              value={newMarket.outcome1}
            />
            <Input
              name="outcome2"
              placeholder="Outcome 2"
              onChange={handleInputChange}
              value={newMarket.outcome2}
            />
            <Input
              name="description"
              placeholder="Market Description"
              onChange={handleInputChange}
              value={newMarket.description}
            />
            <Input
              name="reward"
              type="number"
              placeholder="Reward (in ETH)"
              onChange={handleInputChange}
              value={newMarket.reward}
            />
            <Input
              name="requiredBond"
              type="number"
              placeholder="Required Bond (in ETH)"
              onChange={handleInputChange}
              value={newMarket.requiredBond}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleInitializeMarket} disabled={isInitializing}>
            {isInitializing ? "Initializing..." : "Initialize Market"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Markets</CardTitle>
          <CardDescription>List of all prediction markets</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Market ID</TableHead>
                <TableHead>Outcome 1</TableHead>
                <TableHead>Outcome 2</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Resolved</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {markets.map((market, index) => (
                <TableRow key={index}>
                  <TableCell>{market.marketId}</TableCell>
                  <TableCell>{market.outcome1}</TableCell>
                  <TableCell>{market.outcome2}</TableCell>
                  <TableCell>{market.description}</TableCell>
                  <TableCell>{market.resolved ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <Link href={`/market/${market.marketId}`} passHref>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
