import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultWallets, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { App } from "./App";
import { setup } from "./mud/setup";
import { MUDProvider } from "./MUDContext";
import mudConfig from "contracts/mud.config";
import { MUDNetworkProvider } from "./mud/NetworkContext";
import { DevTools } from "./DevTools";
import { Providers } from "./Providers";

const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("React root not found");
const root = ReactDOM.createRoot(rootElement);

const queryClient = new QueryClient();

// TODO: figure out if we actually want this to be async or if we should render something else in the meantime
// setup().then(async (result) => {
//   root.render(
//     <MUDProvider value={result}>
//       <App />
//     </MUDProvider>,
//   );
// });

setup().then(({ network }) => {
  root.render(
    <Providers>
      <MUDNetworkProvider value={network}>
        <App />
        {import.meta.env.DEV && <DevTools />}
      </MUDNetworkProvider>
    </Providers>
  );
});

// https://vitejs.dev/guide/env-and-mode.html
// if (import.meta.env.DEV) {
//   const { mount: mountDevTools } = await import("@latticexyz/dev-tools");
//   mountDevTools({
//     config: mudConfig,
//     publicClient: result.network.publicClient,
//     walletClient: result.network.walletClient,
//     latestBlock$: result.network.latestBlock$,
//     storedBlockLogs$: result.network.storedBlockLogs$,
//     worldAddress: result.network.worldContract.address,
//     worldAbi: result.network.worldContract.abi,
//     write$: result.network.write$,
//     recsWorld: result.network.world,
//   });
// }

