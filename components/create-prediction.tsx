import { useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { PREDICTION_MARKET_ADDRESS } from "@/constants";
import PREDICTION_MARKET_ABI from "../lib/abi.json";
import { Button } from "./ui/button";

export function CreatePrediction() {
  const [formData, setFormData] = useState({
    question: "",
    imageUri: "",
    bettingDuration: 24, 
    resolutionDuration: 72, 
  });
  const hoursToUnixSeconds = (hours: number): number => {
    const SECONDS_PER_HOUR = 3600;
    return Math.floor(hours * SECONDS_PER_HOUR);
  };
  const [hash, setHash] = useState<any>("");

  const { writeContractAsync } = useWriteContract();

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hash = await writeContractAsync({
      abi: PREDICTION_MARKET_ABI,
      functionName: "createPrediction",
      args: [
        formData.question,
        formData.imageUri,
        hoursToUnixSeconds(formData.bettingDuration),
        hoursToUnixSeconds(formData.resolutionDuration),
      ],
      address: PREDICTION_MARKET_ADDRESS,
    });
    setHash(hash);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-black">
      <div>
        <label
          htmlFor="question"
          className="block text-sm font-medium text-white"
        >
          Question
        </label>
        <input
          type="text"
          id="question"
          name="question"
          value={formData.question}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border p-2"
          required
        />
      </div>

      <div>
        <label
          htmlFor="imageUri"
          className="block text-sm font-medium text-white"
        >
          Image URI
        </label>
        <input
          type="url"
          id="imageUri"
          name="imageUri"
          value={formData.imageUri}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border p-2"
          required
        />
      </div>

      <div>
        <label
          htmlFor="bettingDuration"
          className="block text-sm text-white font-medium"
        >
          Betting Duration (hours)
        </label>
        <input
          type="number"
          id="bettingDuration"
          name="bettingDuration"
          value={formData.bettingDuration}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border p-2"
          required
        />
      </div>

      <div>
        <label
          htmlFor="resolutionDuration"
          className="block text-sm text-white font-medium"
        >
          Resolution Duration (hours)
        </label>
        <input
          type="number"
          id="resolutionDuration"
          name="resolutionDuration"
          value={formData.resolutionDuration}
          onChange={handleChange} // 180 days in hours
          className="mt-1 block w-full rounded-md border p-2"
          required
        />
      </div>

      <Button type="submit">
        {isLoading ? "Creating..." : "Create Prediction"}
      </Button>

      {isSuccess && (
        <div className="mt-2 text-green-600">
          Prediction created successfully!
        </div>
      )}
    </form>
  );
}
