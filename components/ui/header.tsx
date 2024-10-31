import React from "react";
import { Sixtyfour } from "next/font/google";
import { PlusIcon, User } from "lucide-react";
import { Button } from "./button";
import { usePrivy } from "@privy-io/react-auth";
import NewBet from "../new-bet";

export const sixtyfour = Sixtyfour({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});
const Header = () => {
  const { authenticated } = usePrivy();
  return (
    <div className="flex flex-row justify-between w-full p-4">
      <h2 className={`text-primary text-2xl ${sixtyfour.className}`}>SwipeX</h2>
      {authenticated && (
        <div className="flex flex-row gap-2 items-center">
          <Button
            asChild
            variant={"outline"}
            size={"icon"}
            className="text-white p-1"
          >
            <NewBet />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Header;
