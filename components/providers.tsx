"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "@privy-io/wagmi";
import { wagmiConfig } from "@/lib/wagmi-config"; // Changed from createConfig to wagmiConfig
import { ReactNode, useState } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
    </QueryClientProvider>
  );
}
