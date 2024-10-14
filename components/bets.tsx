import React, {useEffect, useMemo, useState} from "react";
import TinderCard from "react-tinder-card";
import BetCard from "./bet-card";

function CardBets() {
  const [wagerAllowance, setWagerAllowance] = useState(500);
  const [showCreateBetCard, setShowCreateBetCard] = useState(false);
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
      name: "Bitcoin Price Bet",
      description:
        "Will Bitcoin be above $50,000 by the end of the month? I speculate it to reach more than that in a month. So, I am betting on it.",
      winPercentage: 60,
      losePercentage: 40,
      imageUrl:
        "https://cdn.pixabay.com/photo/2023/11/08/13/56/ai-generated-8374812_1280.jpg",
      betTime: "24h",
      yesTotalAmount: 1000,
      noTotalAmount: 500,
    },
    {
      id: 2,
      name: "Ethereum Price Bet",
      description: "Will Ethereum be above $3,000 by the end of the month?",
      winPercentage: 40,
      losePercentage: 60,
      imageUrl:
        "https://cdn.pixabay.com/photo/2023/11/08/13/56/ai-generated-8374812_1280.jpg",
      betTime: "24h",
      yesTotalAmount: 500,
      noTotalAmount: 1000,
    },
    {
      id: 3,
      name: "Dogecoin Price Bet",
      description: "Will Dogecoin be above $1 by the end of the month?",
      winPercentage: 80,
      losePercentage: 20,
      imageUrl:
        "https://cdn.pixabay.com/photo/2023/11/08/13/56/ai-generated-8374812_1280.jpg",
      betTime: "24h",
      yesTotalAmount: 2000,
      noTotalAmount: 100,
    },
  ];

  const childRefs = useMemo<any>(
    () =>
      Array(betsHardCoded.length)
        .fill(0)
        .map((i) => React.createRef()),
    []
  );
  return (
    <div className="flex flex-wrap relative w-[90%] h-full m-auto">
      {betsHardCoded.map((bet: any, index) => {
        if (bet.votingClosed) return null;
        return (
          <TinderCard
            ref={childRefs[index]}
            className="absolute top-0 left-0 w-full"
            key={index}
            onSwipe={(dir) => swiped(dir, index)}
            onCardLeftScreen={() => outOfFrame(index)}
          >
            <BetCard
              id={bet.id}
              name={bet.name}
              description={bet.description}
              winPercentage={bet.winPercentage}
              losePercentage={bet.losePercentage}
              imageUrl={bet.imageUrl}
              betTime={bet.betTime}
              yesTotalAmount={bet.yesTotalAmount}
              noTotalAmount={bet.noTotalAmount}
              onYesClick={async () => {
                if (childRefs[index].current)
                  await childRefs[index].current.swipe("right");
              }}
              onNoClick={async () => {
                if (childRefs[index].current)
                  await childRefs[index].current.swipe("left");
              }}
              onPassClick={async () => {
                if (childRefs[index].current)
                  await childRefs[index].current.swipe("up");
              }}
            />
          </TinderCard>
        );
      })}

      {lastLocation && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <h2 className="text-white">You swiped {lastLocation}</h2>
        </div>
      )}
    </div>
  );
}

export default CardBets;
