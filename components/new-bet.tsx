import { useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { PREDICTION_MARKET_ADDRESS } from "@/constants";
import PREDICTION_MARKET_ABI from "../lib/abi.json";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface FormData {
  question: string;
  imageUri: string;
  bettingDuration: number;
  resolutionDuration: number;
}

const NewBet = () => {
  const [step, setStep] = useState(0);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [formData, setFormData] = useState<FormData>({
    question: "",
    imageUri: "",
    bettingDuration: 24,
    resolutionDuration: 72,
  });

  const hoursToUnixSeconds = (hours: number): number => {
    const SECONDS_PER_HOUR = 3600;
    return Math.floor(hours * SECONDS_PER_HOUR);
  };

  const { writeContractAsync } = useWriteContract();

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const steps = [
    { name: "Describe Your Prediction", icon: "💡" },
    { name: "Set Duration", icon: "⏱️" },
    { name: "Add an Image", icon: "🖼️" },
  ];

  const handleNextStep = () =>
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const handlePrevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  const clearFields = () => {
    setFormData({
      question: "",
      imageUri: "",
      bettingDuration: 24,
      resolutionDuration: 72,
    });
    setStep(0);
  };

  const handleCreatePrediction = async (e: React.FormEvent) => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const renderStepContent = () => (
    <div className="flex flex-col justify-between flex-grow">
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-white">
          {steps[step].icon} {steps[step].name}
        </h3>
        {step === 0 && (
          <Textarea
            name="question"
            placeholder="Describe your prediction"
            value={formData.question}
            onChange={handleChange}
            className="w-full h-24 bg-gray-900 text-white border-red-500 focus:border-red-600 resize-none"
          />
        )}
        {step === 1 && (
          <>
            <div className="space-y-2">
              <Label>Betting Duration (hours)</Label>
              <Input
                name="bettingDuration"
                type="number"
                value={formData.bettingDuration}
                onChange={handleChange}
                min="1"
                max="2160"
                className="bg-gray-900 text-white border-red-500 focus:border-red-600"
              />
            </div>
            <div className="space-y-2">
              <Label>Resolution Duration (hours)</Label>
              <Input
                name="resolutionDuration"
                type="number"
                value={formData.resolutionDuration}
                onChange={handleChange}
                className="bg-gray-900 text-white border-red-500 focus:border-red-600"
              />
            </div>
          </>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                name="imageUri"
                type="url"
                placeholder="Enter image URL (http://, https://, or ipfs://)"
                value={formData.imageUri}
                onChange={handleChange}
                className="bg-gray-900 text-white border-red-500 focus:border-red-600"
              />
            </div>

          </div>
        )}
      </div>
    </div>
  );

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
            <SheetHeader>
              <SheetTitle className="text-3xl font-bold text-center text-transparent bg-clip-text bg-white">
                Create Your Prediction
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
              <div className="flex flex-col mt-auto pt-8 pb-4">
                <div className="flex justify-between">
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
                    <Button type="submit" onClick={handleCreatePrediction}>
                      {isLoading ? "Creating..." : "Create Prediction"}
                    </Button>
                  )}
                </div>
                {isSuccess && (
                  <div className="mt-2 text-green-600 text-center">
                    Prediction created successfully!
                  </div>
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
              Prediction Created!
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Your prediction has been successfully created.
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => {
              setIsConfirmationOpen(false);
              clearFields();
            }}
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