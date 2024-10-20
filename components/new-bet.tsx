import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi";
import { parseEther } from "viem";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import predictionMarketABI from "../lib/abi.json";

interface BetData {
  description: string;
  outcome1: string;
  outcome2: string;
  reward: string;
  requiredBond: string;
  image: string | null;
}

const NewBet = () => {
  const [step, setStep] = useState(0);
  const [description, setDescription] = useState("");
  const [outcome1, setOutcome1] = useState("");
  const [outcome2, setOutcome2] = useState("");
  const [betImage, setBetImage] = useState<string | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  // Fixed values for reward and requiredBond
  const reward = "1";
  const requiredBond = "0.5";

  const { address } = useAccount();
  const { writeContractAsync: initializeMarket, data: initializeData } =
    useWriteContract();
  const {
    isLoading: isInitializing,
    isSuccess: isInitialized,
    isPending,
  } = useWaitForTransactionReceipt({
    hash: initializeData,
  });
  useEffect(() => {
    console.log(isInitialized, isPending, isInitializing);
  }, [isInitialized, isPending, isInitializing]);
  const steps = [
    { name: "Describe Your Idea", icon: "💡" },
    { name: "Set Outcomes", icon: "🏆" },
    { name: "Add an Image", icon: "🖼️" },
  ];

  const handleNextStep = () =>
    setStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
  const handlePrevStep = () => setStep((prevStep) => Math.max(prevStep - 1, 0));

  const handleCreateBet = async () => {
    try {
      const tx = await initializeMarket({
        address: process.env
          .NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS as `0x${string}`,
        abi: predictionMarketABI.abi,
        functionName: "initializeMarket",
        args: [
          outcome1,
          outcome2,
          description,
          parseEther("1"),
          parseEther("1"),
          "betImage",
        ],
      });
      console.log(tx);

      // Open confirmation dialog
      setIsConfirmationOpen(true);
    } catch (error) {
      console.error("Failed to initialize market:", error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setBetImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFields = () => {
    setDescription("");
    setOutcome1("");
    setOutcome2("");
    setBetImage(null);
    setStep(0);
  };

  const handleConfirmationClose = () => {
    setIsConfirmationOpen(false);
    clearFields();
  };

  const renderStepContent = () => {
    return (
      <div className="flex flex-col justify-between flex-grow">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white">
            {steps[step].icon} {steps[step].name}
          </h3>
          {step === 0 && (
            <Textarea
              placeholder="Describe your idea for this prediction market"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-24 bg-gray-900 text-white border-red-500 focus:border-red-600 resize-none"
            />
          )}
          {step === 1 && (
            <>
              <Input
                placeholder="Enter Outcome 1"
                value={outcome1}
                onChange={(e) => setOutcome1(e.target.value)}
                className="bg-gray-900 text-white border-red-500 focus:border-red-600"
              />
              <Input
                placeholder="Enter Outcome 2"
                value={outcome2}
                onChange={(e) => setOutcome2(e.target.value)}
                className="bg-gray-900 text-white border-red-500 focus:border-red-600"
              />
            </>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <Label htmlFor="image-upload" className="cursor-pointer">
                <div className="bg-gray-900 text-white border-red-500 border-2 border-dashed rounded-md p-4 text-center">
                  Click to upload an image
                </div>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </Label>
              {betImage && (
                <div className="mt-4">
                  <img
                    src={betImage}
                    alt="Bet preview"
                    className="max-w-full h-auto rounded-md"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Sheet>
        <SheetTrigger>
          <Button className="bg-transparent border text-white h-10 w-10">
            <span className="text-2xl">+</span>
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full bg-black text-white p-0">
          <div className="flex flex-col h-full p-6">
            <SheetHeader className="relative">
              <SheetTitle className="text-3xl font-bold text-center text-transparent bg-clip-text bg-white">
                Create Your Legendary Bet
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col flex-grow mt-6">
              <div className="flex justify-between mb-6">
                {steps.map((s, index) => (
                  <div
                    key={index}
                    className={`flex flex-col items-center ${
                      index === step ? "text-red-500" : "text-gray-500"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === step ? "bg-red-500 text-black" : "bg-gray-800"
                      }`}
                    >
                      {index < step ? "✓" : s.icon}
                    </div>
                    <span className="mt-1 text-xs">{s.name}</span>
                  </div>
                ))}
              </div>
              {renderStepContent()}
              <div className="flex justify-between mt-auto pt-8 pb-4">
                <Button
                  onClick={handlePrevStep}
                  disabled={step === 0}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-800 disabled:hover:bg-gray-800 transition-all duration-300 shadow-[0_0_15px_rgba(220,38,38,0.5)] disabled:shadow-none"
                >
                  ◀ Back
                </Button>
                {step < steps.length - 1 ? (
                  <Button
                    onClick={handleNextStep}
                    className="bg-red-600 hover:bg-red-700 transition-all duration-300 shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                  >
                    Next ▶
                  </Button>
                ) : (
                  <Button
                    onClick={handleCreateBet}
                    disabled={isInitializing}
                    className="bg-red-600 hover:bg-red-700 transition-all duration-300 shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                  >
                    {isInitializing ? "Creating Bet..." : "Place Bet 🎉"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <DialogContent className="bg-black text-white border border-red-500">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Bet Created!
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Your legendary bet has been successfully created and added to your
              profile.
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={handleConfirmationClose}
            className="bg-red-600 hover:bg-red-700 transition-all duration-300 shadow-[0_0_15px_rgba(220,38,38,0.5)]"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewBet;
