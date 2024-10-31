import React from "react";
import MenuBar from "./menu-bar";
import Bets from "./bets";
import {CreatePrediction} from "./create-prediction";

const MainApp = () => {
  return (
    <div className="relative flex flex-col-1 flex-1 w-full h-full overflow-hidden">
      <div className="flex flex-1 w-full h-full">
        <Bets />
      </div>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-white w-[90%] m-auto">
          Markets
        </h1>
        <Bets />
      </div>
      <MenuBar />
    </div>
  );
};

export default MainApp;
