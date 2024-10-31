import React, { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { PREDICTION_MARKET_ADDRESS } from "@/constants";
import PREDICTION_MARKET_ABI from "../lib/abi.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ImageOff } from "lucide-react";
import Image from "next/image";

interface PredictionView {
  id: number;
  creator: `0x${string}`;
  question: string;
  imageUri: string;
  resolutionTime: bigint;
  bettingEndTime: bigint;
  isResolved: boolean;
  outcome: boolean;
  totalYesAmount: bigint;
  totalNoAmount: bigint;
}

interface PredictionDetails {
  0: `0x${string}`;
  1: string;
  2: string;
  3: string;
  4: bigint;
  5: boolean;
  6: boolean;
  7: bigint;
  8: bigint;
  9: bigint;
}

const transformPredictionData = (rawData: unknown): PredictionView => {
  const data = rawData as any;
  return {
    id: Number(data.id || 0),
    creator: (data.creator || "0x0") as `0x${string}`,
    question: String(data.question || ""),
    imageUri: String(data.imageUri || ""),
    resolutionTime: BigInt(data.resolutionTime || 0),
    bettingEndTime: BigInt(data.bettingEndTime || 0),
    isResolved: Boolean(data.isResolved),
    outcome: Boolean(data.outcome),
    totalYesAmount: BigInt(data.totalYesAmount || 0),
    totalNoAmount: BigInt(data.totalNoAmount || 0),
  };
};

const ReadBets: React.FC = () => {
  const [selectedPrediction, setSelectedPrediction] = useState<number | null>(
    null
  );
  const [viewType, setViewType] = useState<"all" | "active" | "details">("all");
  const [error, setError] = useState<string | null>(null);

  const {
    data: rawPredictions,
    isError: isPredictionsError,
    isLoading: isPredictionsLoading,
    refetch: refetchAll,
  } = useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: "getAllPredictions",
  }) as {
    data: unknown[] | undefined;
    isError: boolean;
    isLoading: boolean;
    refetch: () => void;
  };

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

  const {
    data: predictionDetails,
    isError: isDetailsError,
    isLoading: isDetailsLoading,
    refetch: refetchDetails,
  } = useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: "getPredictionDetails",
    args:
      selectedPrediction !== null ? [BigInt(selectedPrediction)] : undefined,
  }) as {
    data: PredictionDetails | undefined;
    isError: boolean;
    isLoading: boolean;
    refetch: () => void;
  };

  const predictions = React.useMemo(() => {
    if (!rawPredictions || !Array.isArray(rawPredictions)) return [];
    return rawPredictions.map(transformPredictionData);
  }, [rawPredictions]);

  const activePredictions = React.useMemo(() => {
    if (!rawActivePredictions || !Array.isArray(rawActivePredictions))
      return [];
    return rawActivePredictions.map(transformPredictionData);
  }, [rawActivePredictions]);

  useEffect(() => {
    if (isPredictionsError) {
      setError("Failed to fetch predictions");
    } else if (isActivePredictionsError) {
      setError("Failed to fetch active predictions");
    } else if (isDetailsError) {
      setError("Failed to fetch prediction details");
    } else {
      setError(null);
    }
  }, [isPredictionsError, isActivePredictionsError, isDetailsError]);

  const formatTime = (timestamp: bigint): string => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount: bigint): string => {
    return (Number(amount) / 1e6).toFixed(2);
  };

  const renderPredictionCard = (
    prediction: PredictionView
  ): React.ReactElement => {
    console.log(prediction.imageUri);
    return (
      <Card key={prediction.id} className="mb-4 bg-gray-900 border-gray-800">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-bold text-white">
              {prediction.question}
            </CardTitle>
            <Badge variant={prediction.isResolved ? "secondary" : "default"}>
              {prediction.isResolved ? "Resolved" : "Active"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Image
              width={400}
              height={400}
              src={prediction.imageUri}
              alt={prediction.imageUri}
            />
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Creator:</span>
                <span className="font-medium text-white">
                  {formatAddress(prediction.creator)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Betting Ends:</span>
                <span className="font-medium text-white">
                  {formatTime(prediction.bettingEndTime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Yes Amount:</span>
                <span className="font-medium text-white">
                  {formatAmount(prediction.totalYesAmount)} USDC
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total No Amount:</span>
                <span className="font-medium text-white">
                  {formatAmount(prediction.totalNoAmount)} USDC
                </span>
              </div>
              <Button
                onClick={() => {
                  setSelectedPrediction(prediction.id);
                  setViewType("details");
                }}
                className="w-full mt-2"
              >
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const isLoading =
    isPredictionsLoading || isActivePredictionsLoading || isDetailsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading predictions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-8">
        {error}
        <Button
          onClick={() => {
            setError(null);
            if (viewType === "all") refetchAll();
            else if (viewType === "active") refetchActive();
            else if (selectedPrediction !== null) refetchDetails();
          }}
          variant="outline"
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex gap-4 p-4">
        <Button
          onClick={() => {
            setViewType("all");
            refetchAll();
          }}
          variant={viewType === "all" ? "default" : "outline"}
          className="flex-1"
        >
          All Predictions ({predictions.length})
        </Button>
        <Button
          onClick={() => {
            setViewType("active");
            refetchActive();
          }}
          variant={viewType === "active" ? "default" : "outline"}
          className="flex-1"
        >
          Active Predictions ({activePredictions.length})
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {viewType === "all" &&
          (predictions.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No predictions found
            </div>
          ) : (
            predictions.map(renderPredictionCard)
          ))}

        {viewType === "active" &&
          (activePredictions.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No active predictions found
            </div>
          ) : (
            activePredictions.map(renderPredictionCard)
          ))}

        {viewType === "details" &&
          selectedPrediction !== null &&
          predictionDetails && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg text-white">
                    Prediction Details
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setViewType("all");
                      setSelectedPrediction(null);
                    }}
                  >
                    Back
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Image
                    width={400}
                    height={400}
                    src={predictionDetails[2]}
                    alt={predictionDetails[1]}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-gray-400">Creator:</div>
                    <div className="text-white">
                      {formatAddress(predictionDetails[0])}
                    </div>

                    <div className="text-gray-400">Question:</div>
                    <div className="text-white">{predictionDetails[1]}</div>

                    <div className="text-gray-400">Resolution Time:</div>
                    <div className="text-white">
                      {formatTime(BigInt(predictionDetails[3]))}
                    </div>

                    <div className="text-gray-400">Betting End Time:</div>
                    <div className="text-white">
                      {formatTime(predictionDetails[4])}
                    </div>

                    <div className="text-gray-400">Status:</div>
                    <div className="text-white">
                      {predictionDetails[5] ? "Resolved" : "Active"}
                    </div>

                    {predictionDetails[5] && (
                      <>
                        <div className="text-gray-400">Outcome:</div>
                        <div className="text-white">
                          {predictionDetails[6] ? "Yes" : "No"}
                        </div>
                      </>
                    )}

                    <div className="text-gray-400">Total Yes Amount:</div>
                    <div className="text-white">
                      {formatAmount(predictionDetails[7])} USDC
                    </div>

                    <div className="text-gray-400">Total No Amount:</div>
                    <div className="text-white">
                      {formatAmount(predictionDetails[8])} USDC
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
};

export default ReadBets;
