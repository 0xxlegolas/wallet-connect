
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useComponentValue } from "@latticexyz/react";
import { useMUD } from "./mud/customWalletClient";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { increment } from "./mud/createSystemCalls";

export const App = () => {
  const { network, walletClient } = useMUD();

  // const counter = useComponentValue(Counter, singletonEntity);
  const counter = network.useStore((state) => state.getValue(network.tables.Counter, {}));

  return (
    <>
    <div className="connect-button-container">
        <ConnectButton />
      </div>
      <div>
        Counter:
        <span>{counter?.value ?? "??"}</span>
      </div>
      <div>
        {walletClient && (
          <button type="button" onClick={() => increment(walletClient, network)}>
            Increment
          </button>
        )}
      </div>
    </>
  );
};
