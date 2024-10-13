import React from "react";
import {Button} from "./ui/button";
import {motion} from "framer-motion";
import {usePrivy} from "@privy-io/react-auth";

const Hero = () => {
  const {login} = usePrivy();
  return (
    <div
      className="flex flex-1 w-screen items-center justify-center relative overflow-hidden"
      style={{
        background:
          "radial-gradient(circle, rgba(127,29,29,1) 0%, rgba(0,0,0,1) 100%)",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-44 h-44 bg-red-300 rounded-full opacity-20 filter blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-slate-200 w-[94%] m-auto">
        <h1 className="text-4xl font-bold mb-8 items-center justify-center text-center">
          swipe like tinder, but make moniee🤑💸
        </h1>
        <p className="text-lg text-center mb-8">
          bet w/ your mentally unstable crypto friends and make money.
        </p>
        <Button variant="default" onClick={login}>
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Hero;
