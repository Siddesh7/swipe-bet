"use client";

import {PrivyProvider} from "@privy-io/react-auth";

export default function PrivyWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivyProvider
      appId="cm25zyohn01jrbegr4c6ndoap"
      config={{
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
        },

        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
