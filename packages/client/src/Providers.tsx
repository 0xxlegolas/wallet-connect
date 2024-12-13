import { WagmiProvider, createConfig, fallback, http, webSocket } from "wagmi";
import { injected, metaMask, safe } from "wagmi/connectors";
import { ReactNode, useMemo, useEffect, useState } from "react";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SetupResult, setup } from "./mud/setup";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
    const [wagmiConfig, setWagmiConfig] = useState(null);

    useEffect(() => {
        setup().then((result: SetupResult) => {
            setWagmiConfig(result.wagmiConfig);
        });
    }, []);

    if (!wagmiConfig) {
        return <div>Loading...</div>;
    }

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={darkTheme({
                        accentColor: "#FF8C00",
                        accentColorForeground: "black",
                    })}
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}