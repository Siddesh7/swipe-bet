import React from "react";
import { Button } from "./ui/button";

const Mobile = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen md:hidden">
      <Button>Login</Button>
    </div>
  );
};

export default Mobile;
