import React, {useEffect, useState} from "react";
import TinderCard from "react-tinder-card";
import BetCard from "./bet-card";
import {Plus} from "lucide-react";

function CardBets() {
  const [wagerAllowance, setWagerAllowance] = useState(500);

  const [lastLocation, setLastLocation] = useState("");
  const swiped = (direction, nameToDelete) => {
    console.log("removing: " + nameToDelete);
    setLastLocation(direction);
    if (direction === "right") setWagerAllowance((prev) => prev - 100);
  };

  const outOfFrame = (name) => {
    console.log(name + " left the screen!");
  };

  const betsHardCoded = [
    {
      id: 1,
      info: "Bet on whether the price of Bitcoin will be above $50,000 by the end of the month.",
      initialStake: 100,
      peopleArray: ["0x1234567890abcdef", "0xabcdef1234567890"],
      winningCriteria: "Price of Bitcoin is above $50,000",
      votingClosed: false,
    },
    {
      id: 2,
      info: "Bet on whether the price of Ethereum will be above $2,000 by the end of the month.",
      initialStake: 100,
      peopleArray: ["0x1234567890abcdef", "0xabcdef1234567890"],
      winningCriteria: "Price of Ethereum is above $2,000",
      votingClosed: false,
    },
    {
      id: 3,
      info: "Bet on whether the price of Dogecoin will be above $0.50 by the end of the month.",
      initialStake: 100,
      peopleArray: ["0x1234567890abcdef", "0xabcdef1234567890"],
      winningCriteria: "Price of Dogecoin is above $0.50",
      votingClosed: false,
    },
  ];

  return (
    <div className="flex flex-wrap relative w-[96%] h-full m-auto">
      {betsHardCoded &&
        betsHardCoded.map((bet: any) => {
          if (bet.votingClosed) return null;
          return (
            <TinderCard
              className="absolute top-0 left-0 w-full"
              key={bet.id}
              onSwipe={(dir) => swiped(dir, bet.id)}
              onCardLeftScreen={() => outOfFrame(bet.id)}
            >
              <BetCard
                description={bet.info}
                stake={bet.initialStake}
                people={bet.peopleArray}
                criteria={bet.winningCriteria}
              />
            </TinderCard>
          );
        })}

      {/* {lastLocation && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <h2 className="text-white">You swiped {lastLocation}</h2>
        </div>
      )} */}
    </div>
  );
}

export default CardBets;
