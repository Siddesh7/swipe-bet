import React from "react";
import MenuBar from "./menu-bar";
import Bets from "./bets";

const MainApp = () => {
  return (
    <div className="relative flex flex-col flex-1 w-full h-full overflow-hidden">
      <div className="flex flex-1 w-full h-full">
        <Bets />
      </div>
      <MenuBar />
    </div>
  );
};

export default MainApp;
