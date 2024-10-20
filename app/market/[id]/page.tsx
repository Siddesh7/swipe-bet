"use client";

import {useRouter} from "next/router";
import {useState} from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import {parseEther} from "viem";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Switch} from "@/components/ui/switch";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import predictionMarketABI from "../../../lib/abi.json";

interface Market {
  resolved: boolean;
  assertedOutcomeId: string;
  outcome1Token: string;
  outcome2Token: string;
  reward: bigint;
  requiredBond: bigint;
  outcome1: string;
  outcome2: string;
  description: string;
  outcome1Pool: bigint;
  outcome2Pool: bigint;
}

export default function MarketDetail() {
  const router = useRouter();
  const {id} = router.query;

  const [assertedOutcome, setAssertedOutcome] = useState("");
  const [tokensToCreate, setTokensToCreate] = useState("");
  const [isOutcomeOne, setIsOutcomeOne] = useState(true);
  const [maxCurrencySpent, setMaxCurrencySpent] = useState("");

  const {data: market} = useReadContract({
    address: process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS as `0x${string}`,
    abi: predictionMarketABI.abi,
    functionName: "getMarket",
    args: [id as string],
  }) as {data: Market};

  const {writeContract: assertMarket, data: assertData} = useWriteContract();
  const {writeContract: createTokens, data: createData} = useWriteContract();
  const {writeContract: buyTokens, data: buyData} = useWriteContract();

  const {isLoading: isAsserting} = useWaitForTransactionReceipt({
    hash: assertData?.hash,
  });

  const {isLoading: isCreating} = useWaitForTransactionReceipt({
    hash: createData?.hash,
  });

  const {isLoading: isBuying} = useWaitForTransactionReceipt({
    hash: buyData?.hash,
  });

  const handleAssertMarket = async () => {
    try {
      await assertMarket({
        address: process.env
          .NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS as `0x${string}`,
        abi: predictionMarketABI.abi,
        functionName: "assertMarket",
        args: [id, assertedOutcome],
      });
    } catch (error) {
      console.error("Failed to assert market:", error);
    }
  };

  const handleCreateTokens = async () => {
    try {
      await createTokens({
        address: process.env
          .NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS as `0x${string}`,
        abi: predictionMarketABI.abi,
        functionName: "createOutcomeTokens",
        args: [id, parseEther(tokensToCreate)],
      });
    } catch (error) {
      console.error("Failed to create tokens:", error);
    }
  };

  const handleBuyTokens = async () => {
    try {
      await buyTokens({
        address: process.env
          .NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS as `0x${string}`,
        abi: predictionMarketABI.abi,
        functionName: "buyOutcomeTokens",
        args: [id, isOutcomeOne, parseEther(maxCurrencySpent)],
      });
    } catch (error) {
      console.error("Failed to buy tokens:", error);
    }
  };

  if (!market) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Market Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Outcome 1: {market.outcome1}</p>
          <p>Outcome 2: {market.outcome2}</p>
          <p>Description: {market.description}</p>
          <p>Resolved: {market.resolved ? "Yes" : "No"}</p>
          <p>Outcome 1 Pool: {market.outcome1Pool.toString()} wei</p>
          <p>Outcome 2 Pool: {market.outcome2Pool.toString()} wei</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Assert Market Outcome</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Asserted Outcome"
              onChange={(e) => setAssertedOutcome(e.target.value)}
              value={assertedOutcome}
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleAssertMarket} disabled={isAsserting}>
              {isAsserting ? "Asserting..." : "Assert Outcome"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Outcome Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              placeholder="Tokens to Create"
              onChange={(e) => setTokensToCreate(e.target.value)}
              value={tokensToCreate}
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleCreateTokens} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Tokens"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Buy Outcome Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Switch
                checked={isOutcomeOne}
                onCheckedChange={setIsOutcomeOne}
              />
              <span>{isOutcomeOne ? "Outcome 1" : "Outcome 2"}</span>
            </div>
            <Input
              type="number"
              placeholder="Max Currency to Spend"
              onChange={(e) => setMaxCurrencySpent(e.target.value)}
              value={maxCurrencySpent}
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleBuyTokens} disabled={isBuying}>
              {isBuying ? "Buying..." : "Buy Tokens"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
