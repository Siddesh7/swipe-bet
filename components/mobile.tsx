import React from "react";
import {Button} from "./ui/button";
import Header from "./ui/header";
import Hero from "./hero";

const Mobile = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen overflow-hidden md:hidden">
      <Header />
      <Hero />
    </div>
  );
};

export default Mobile;
