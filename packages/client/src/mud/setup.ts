/*
 * This file sets up all the definitions required for a MUD client.
 */
import { createConfig } from "wagmi";
import { createClientComponents } from "./createClientComponents";
import { createSystemCalls } from "./createSystemCalls";
import { setupNetwork } from "./setupNetwork";

export type SetupResult = Awaited<ReturnType<typeof setup>>;

export async function setup() {
  const network = await setupNetwork();
  const components = createClientComponents(network);
  const systemCalls = createSystemCalls(network, components);
  const wagmiConfig = createConfig({
    chains: [network.publicClient.chain],
    client: () => network.publicClient,
  });

  return {
    network,
    components,
    systemCalls,
    wagmiConfig,
  };
}
