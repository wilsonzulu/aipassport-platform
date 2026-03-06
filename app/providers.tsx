"use client";

import * as React from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultConfig, darkTheme } from "@rainbow-me/rainbowkit";
import { polygonAmoy } from "wagmi/chains";

import "@rainbow-me/rainbowkit/styles.css";

const wcProjectId =
  process.env.NEXT_PUBLIC_WC_PROJECT_ID || "fccd3aa241cc4f67f943df31e454a170";

const config = getDefaultConfig({
  appName: "AI Meta Passport",
  projectId: wcProjectId,
  chains: [polygonAmoy],
  ssr: false,
});

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}