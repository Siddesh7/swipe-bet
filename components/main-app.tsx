import React from "react";
import MenuBar from "./menu-bar";
import Bets from "./bets";
import { CreatePrediction } from "./create-prediction";
import ReadBets from "./read-bets";

const MainApp = () => {
  return (
    <div className="relative flex flex-col-1 flex-1 w-full h-full overflow-hidden">
      <div className="flex flex-1 w-full h-full">
        <Bets />
      </div>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-white">
          Prediction Market
        </h1>
        <Bets />
      </div>
      <MenuBar />
    </div>
  );
};

export default MainApp;
