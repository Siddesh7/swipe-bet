"use client";

import React, {useState, useEffect} from "react";
import {useWriteContract, useWaitForTransactionReceipt} from "wagmi";
import {parseEther} from "viem";
import contractABI from "../lib/abi.json";

export function CreateMarket() {
  const [outcome1, setOutcome1] = useState("");
  const [outcome2, setOutcome2] = useState("");
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState("");
  const [requiredBond, setRequiredBond] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const {writeContractAsync, error: writeError} = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: waitError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    enabled: !!txHash,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log(
        "Submitting transaction with args:",
        outcome1,
        outcome2,
        description,
        reward,
        requiredBond
      );
      console.log({
        address: process.env
          .NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS as `0x${string}`,
        abi: contractABI.abi,
        functionName: "initializeMarket",
        args: [
          outcome1,
          outcome2,
          description,
          parseEther(reward),
          parseEther(requiredBond),
        ],
      });
      const hash = await writeContractAsync({
        address: process.env
          .NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS as `0x${string}`,
        abi: contractABI.abi,
        functionName: "initializeMarket",
        args: [
          outcome1,
          outcome2,
          description,
          parseEther(reward),
          parseEther(requiredBond),
        ],
      });
      console.log(`Transaction submitted. Hash: ${hash}`);
      setTxHash(hash);
    } catch (err) {
      console.error("Error in transaction submission:", err);
    }
  };

  useEffect(() => {
    if (isConfirmed && txHash) {
      console.log("Transaction confirmed:", txHash);
    }
  }, [isConfirmed, txHash]);

  if (writeError) {
    console.error("Contract write error:", writeError);
  }

  if (waitError) {
    console.error("Transaction wait error:", waitError);
  }

  return (
    <div>
      <h2>Create a New Market</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="outcome1">Outcome 1:</label>
          <input
            id="outcome1"
            value={outcome1}
            onChange={(e) => setOutcome1(e.target.value)}
            required
            className="text-black"
          />
        </div>
        <div>
          <label htmlFor="outcome2">Outcome 2:</label>
          <input
            id="outcome2"
            value={outcome2}
            onChange={(e) => setOutcome2(e.target.value)}
            required
            className="text-black"
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="text-black"
          />
        </div>
        <div>
          <label htmlFor="reward">Reward (in ETH):</label>
          <input
            id="reward"
            type="number"
            step="0.01"
            value={reward}
            onChange={(e) => setReward(e.target.value)}
            required
            className="text-black"
          />
        </div>
        <div>
          <label htmlFor="requiredBond">Required Bond (in ETH):</label>
          <input
            id="requiredBond"
            type="number"
            step="0.01"
            value={requiredBond}
            onChange={(e) => setRequiredBond(e.target.value)}
            required
            className="text-black"
          />
        </div>
        <button type="submit" disabled={isConfirming}>
          {isConfirming ? "Confirming..." : "Create"}
        </button>
      </form>
      {isConfirming && <p>Waiting for transaction confirmation...</p>}
      {isConfirmed && <p>Market created successfully!</p>}
      {(writeError || waitError) && (
        <p className="text-red-500">
          Error: {writeError?.message || waitError?.message}
        </p>
      )}
    </div>
  );
}
