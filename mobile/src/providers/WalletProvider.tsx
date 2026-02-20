import React, { createContext, useContext } from "react";

interface WalletContextType {
  connectWallet: () => Promise<string | null>;
  disconnect:    () => void;
}

const WalletContext = createContext<WalletContextType>({
  connectWallet: async () => null,
  disconnect:    () => {},
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  // TODO: Wire in WalletConnect v2 / wagmi
  const connectWallet = async (): Promise<string | null> => {
    return "0xMockAddress";
  };

  const disconnect = () => {};

  return (
    <WalletContext.Provider value={{ connectWallet, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
