"use client";
import React, {useState, useEffect} from "react";
import {useReadContract} from "wagmi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card";
import {bytesToString, hexToString, formatEther} from "viem";

// Define types for our Market structure
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
}

// Define type for the formatted market data
interface FormattedMarket
  extends Omit<Market, "outcome1" | "outcome2" | "description" | "reward"> {
  id: `0x${string}`;
  outcome1: string;
  outcome2: string;
  description: string;
  reward: string;
}

// ABI for the getAllMarkets function
const abi = [
  {
    inputs: [],
    name: "getAllMarkets",
    outputs: [
      {
        internalType: "bytes32[]",
        name: "",
        type: "bytes32[]",
      },
      {
        components: [
          {internalType: "bool", name: "resolved", type: "bool"},
          {internalType: "bytes32", name: "assertedOutcomeId", type: "bytes32"},
          {internalType: "address", name: "outcome1Token", type: "address"},
          {internalType: "address", name: "outcome2Token", type: "address"},
          {internalType: "uint256", name: "reward", type: "uint256"},
          {internalType: "uint256", name: "requiredBond", type: "uint256"},
          {internalType: "bytes", name: "outcome1", type: "bytes"},
          {internalType: "bytes", name: "outcome2", type: "bytes"},
          {internalType: "bytes", name: "description", type: "bytes"},
        ],
        internalType: "struct PredictionMarket.Market[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

interface PredictionMarketsProps {
  contractAddress: `0x${string}`;
}

const PredictionMarkets: React.FC<PredictionMarketsProps> = ({
  contractAddress,
}) => {
  const [markets, setMarkets] = useState<FormattedMarket[]>([]);

  const {data, isError, isLoading} = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: "getAllMarkets",
  });

  console.log(data, isError, isLoading);

  useEffect(() => {
    if (data) {
      const [marketIds, marketDetails] = data;
      const formattedMarkets: FormattedMarket[] = marketIds.map((id, index) => {
        const market = marketDetails[index];
        return {
          id,
          ...market,
          outcome1: hexToString(market.outcome1),
          outcome2: hexToString(market.outcome2),
          description: hexToString(market.description),
          reward: formatEther(market.reward),
        };
      });
      setMarkets(formattedMarkets);
    }
  }, [data]);

  if (isLoading) return <div>Loading markets...</div>;
  if (isError) return <div>Error fetching markets</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prediction Markets</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Outcome 1</TableHead>
              <TableHead>Outcome 2</TableHead>
              <TableHead>Resolved</TableHead>
              <TableHead>Reward (ETH)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {markets.map((market) => (
              <TableRow key={market.id}>
                <TableCell>{market.description}</TableCell>
                <TableCell>{market.outcome1}</TableCell>
                <TableCell>{market.outcome2}</TableCell>
                <TableCell>{market.resolved ? "Yes" : "No"}</TableCell>
                <TableCell>{market.reward}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PredictionMarkets;
