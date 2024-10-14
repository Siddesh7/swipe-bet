import React, { useState } from "react";
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

const NewBet = ({
  onCreateBet,
}: {
  onCreateBet: (bet: {
    name: string;
    time: string;
    amount: number;
    description: string;
    image: string | null;
  }) => void;
}) => {
  const [step, setStep] = useState(0);
  const [betName, setBetName] = useState("");
  const [betTime, setBetTime] = useState("");
  const [betAmount, setBetAmount] = useState(10);
  const [betDescription, setBetDescription] = useState("");
  const [betImage, setBetImage] = useState<string | null>(null);

  const steps = [
    { name: "Name Your Bet", icon: "🏆" },
    { name: "Set the Date", icon: "📅" },
    { name: "Place Your Wager", icon: "💰" },
    { name: "Describe Your Bet", icon: "📝" },
    { name: "Add an Image", icon: "🖼️" },
  ];

  const handleNextStep = () =>
    setStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
  const handlePrevStep = () => setStep((prevStep) => Math.max(prevStep - 1, 0));

  const handleCreateBet = () => {
    onCreateBet({
      name: betName,
      time: betTime,
      amount: betAmount,
      description: betDescription,
      image: betImage,
    });
    setStep(0);
    setBetName("");
    setBetTime("");
    setBetAmount(10);
    setBetDescription("");
    setBetImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBetImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderStepContent = () => {
    return (
      <div className="flex flex-col justify-between flex-grow">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white">
            {steps[step].icon} {steps[step].name}
          </h3>
          {step === 0 && (
            <Input
              placeholder="Enter an epic name for your bet"
              value={betName}
              onChange={(e) => setBetName(e.target.value)}
              className="bg-gray-900 text-white border-red-500 focus:border-red-600"
            />
          )}
          {step === 1 && (
            <Input
              type="datetime-local"
              value={betTime}
              onChange={(e) => setBetTime(e.target.value)}
              className="bg-gray-900 text-white border-red-500 focus:border-red-600"
            />
          )}
          {step === 2 && (
            <>
              <div className="flex items-center justify-center space-x-4">
                <Button
                  onClick={() => setBetAmount(Math.max(0, betAmount - 5))}
                  className="bg-red-600 hover:bg-red-700"
                >
                  -
                </Button>
                <span className="text-4xl font-bold text-white">
                  ${betAmount}
                </span>
                <Button
                  onClick={() => setBetAmount(betAmount + 5)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  +
                </Button>
              </div>
              <Button
                onClick={() =>
                  setBetAmount(Math.floor(Math.random() * 100) + 1)
                }
                className="w-full bg-red-600 hover:bg-red-700"
              >
                🎲 Roll for Random Amount
              </Button>
            </>
          )}
          {step === 3 && (
            <Textarea
              placeholder="What's your bet all about?"
              value={betDescription}
              onChange={(e) => setBetDescription(e.target.value)}
              className="w-full h-24 bg-gray-900 text-white border-red-500 focus:border-red-600 resize-none"
            />
          )}
          {step === 4 && (
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
                  className="bg-red-600 hover:bg-red-700 transition-all duration-300 shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                >
                  Place Bet 🎉
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NewBet;
