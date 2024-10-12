import { Menu } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navbar() {
  return (
    <nav className="bg-transparent shadow-2xl text-white">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="flex items-center flex-1">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold tracking-tight">Swipe-Bet</span>
          </Link>
        </div>
        <div className="flex items-center space-x-4 md:flex">
          <Button
            variant="ghost"
            className="text-white hover:bg-gray-600 "
          >
            Component 1
          </Button>
          <Button
            variant="ghost"
            className="text-white hover:text-red-100 hover:bg-red-600"
          >
            Component 2
          </Button>
          <Button
            variant="ghost"
            className="text-white hover:text-red-100 hover:bg-red-600"
          >
            Component 3
          </Button>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-red-600"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-red-500 text-white">
            <nav className="flex flex-col space-y-4">
              <Button
                variant="ghost"
                className="text-white hover:text-red-100 hover:bg-red-600"
              >
                Component 1
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:text-red-100 hover:bg-red-600"
              >
                Component 2
              </Button>
              <Button
                variant="outline"
                className="text-white border-white hover:bg-red-600 hover:text-white"
              >
                Component 3
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
