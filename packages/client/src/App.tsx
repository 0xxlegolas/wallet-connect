import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useComponentValue } from "@latticexyz/react";
import { useMUD } from "./mud/customWalletClient";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { increment } from "./mud/createSystemCalls";
import './App.css'; 
export const App = () => {
  const { network, walletClient } = useMUD();

  // const counter = useComponentValue(Counter, singletonEntity);
  const counter = network.useStore((state) => state.getValue(network.tables.Counter, {}));

  return (
    <div className="app-container">
      <div className="connect-button-container">
        <ConnectButton />
      </div>
      <div className="counter-container">
        <h2>Counter:</h2>
        <span className="counter-value">{counter?.value ?? "??"}</span>
      </div>
      <div className="increment-button-container">
        {walletClient && (
          <button className="increment-button" type="button" onClick={() => increment(walletClient, network)}>
            Increment
          </button>
        )}
      </div>
    </div>
  );
};