import React from "react";
import {Button} from "./ui/button";
import {User} from "lucide-react";

const MenuBar = () => {
  return (
    <div className="absolute bottom-0 w-full flex flex-row justify-between gap-4 p-8 pt-4 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border-t rounded-t-lg border-white border-opacity-20">
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white hover:bg-opacity-20"
      >
        <User className="w-8 h-8 text-white" />
      </Button>
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white hover:bg-opacity-20"
      >
        <User className="w-8 h-8 text-white" />
      </Button>
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white hover:bg-opacity-20"
      >
        <User className="w-8 h-8 text-white" />
      </Button>
    </div>
  );
};

export default MenuBar;
