"use client";

import {Button} from "@/components/ui/button";
import {usePrivy} from "@privy-io/react-auth";
import Image from "next/image";

export default function Home() {
  const {login, logout, ready, authenticated} = usePrivy();
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {authenticated ? (
        <Button onClick={logout}>Logout</Button>
      ) : (
        <Button onClick={login}>Login</Button>
      )}
    </div>
  );
}
