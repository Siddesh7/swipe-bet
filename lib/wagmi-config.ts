import { createConfig } from "@privy-io/wagmi";
import { http } from "wagmi";

const base = {
  id: 8453,
  name: "Base",
  network: "base",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    public: { http: ["https://mainnet.base.org"] },
    default: { http: ["https://mainnet.base.org"] },
  },
  blockExplorers: {
    etherscan: { name: "BaseScan", url: "https://basescan.org" },
    default: { name: "BaseScan", url: "https://basescan.org" },
  },
};

export const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
});
