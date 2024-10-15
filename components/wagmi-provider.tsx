"use client";

import { WagmiProvider as WagmiProviderBase } from "@privy-io/wagmi";
import { wagmiConfig } from "@/lib/wagmi-config";
import { ReactNode } from "react";

export function WagmiProvider({ children }: { children: ReactNode }) {
  return <WagmiProviderBase config={wagmiConfig}>{children}</WagmiProviderBase>;
}
