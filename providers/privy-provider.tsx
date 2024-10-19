"use client";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

import {PrivyProvider} from "@privy-io/react-auth";
// Make sure to import these from `@privy-io/wagmi`, not `wagmi`
import {WagmiProvider, createConfig} from "@privy-io/wagmi";

import {foundry} from "viem/chains";
import {http} from "wagmi";

import type {PrivyClientConfig} from "@privy-io/react-auth";

export const privyConfig: PrivyClientConfig = {
  defaultChain: foundry,
  supportedChains: [foundry],
};
// Replace these with your app's chains

export const config = createConfig({
  chains: [foundry],
  transports: {
    [foundry.id]: http(`http://localhost:8545`),
  },
});
const queryClient = new QueryClient();

export default function Providers({children}: {children: React.ReactNode}) {
  return (
    <PrivyProvider appId="cm25zyohn01jrbegr4c6ndoap" config={privyConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
