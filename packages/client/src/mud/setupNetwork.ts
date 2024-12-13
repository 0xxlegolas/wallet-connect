/*
 * The MUD client code is built on top of viem
 * (https://viem.sh/docs/getting-started.html).
 * This line imports the functions we need from it.
 */
import {
  createPublicClient,
  fallback,
  webSocket,
  http,
  createWalletClient,
  Hex,
  ClientConfig,
  getContract,
} from "viem";
import { encodeEntity, syncToRecs } from "@latticexyz/store-sync/recs";
import { syncToZustand } from "@latticexyz/store-sync/zustand";

import { getNetworkConfig } from "./getNetworkConfig";
import { world } from "./world";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { createBurnerAccount, transportObserver, ContractWrite } from "@latticexyz/common";
import { transactionQueue, writeObserver } from "@latticexyz/common/actions";

import { Subject, share } from "rxjs";

/*
 * Import our MUD config, which includes strong types for
 * our tables and other config options. We use this to generate
 * things like RECS components and get back strong types for them.
 *
 * See https://mud.dev/templates/typescript/contracts#mudconfigts
 * for the source of this information.
 */
import mudConfig from "contracts/mud.config";

export type SetupNetworkResult = Awaited<ReturnType<typeof setupNetwork>>;

export async function setupNetwork() {
  const networkConfig = await getNetworkConfig();

  /*
   * Create a viem public (read only) client
   * (https://viem.sh/docs/clients/public.html)
   */
  const clientOptions = {
    chain: networkConfig.chain,
    transport: transportObserver(fallback([webSocket(), http()])),
    pollingInterval: 1000,
  } as const satisfies ClientConfig;

  const publicClient = createPublicClient(clientOptions);

  /*
   * Create an observable for contract writes that we can
   * pass into MUD dev tools for transaction observability.
   */
  const write$ = new Subject<ContractWrite>();

  /*
   * Create a temporary wallet and a viem client for it
   * (see https://viem.sh/docs/clients/wallet.html).
   */
  const burnerAccount = createBurnerAccount(networkConfig.privateKey as Hex);
  const burnerWalletClient = createWalletClient({
    ...clientOptions,
    account: burnerAccount,
  })
    .extend(transactionQueue())
    .extend(writeObserver({ onWrite: (write) => write$.next(write) }));

  /*
   * Create an object for communicating with the deployed World.
   */
  const worldContract = getContract({
    address: networkConfig.worldAddress as Hex,
    abi: IWorldAbi,
    client: { public: publicClient, wallet: burnerWalletClient },
  });

  const { tables, useStore } = await syncToZustand({
    config: mudConfig,
    address: networkConfig.worldAddress as Hex,
    publicClient,
    startBlock: BigInt(networkConfig.initialBlockNumber),
  });

  /*
   * Sync on-chain state into RECS and keeps our client in sync.
   * Uses the MUD indexer if available, otherwise falls back
   * to the viem publicClient to make RPC calls to fetch MUD
   * events from the chain.
   */
  const { components, latestBlock$, storedBlockLogs$, waitForTransaction } = await syncToRecs({
    world,
    config: mudConfig,
    address: networkConfig.worldAddress as Hex,
    publicClient,
    startBlock: BigInt(networkConfig.initialBlockNumber),
  });

  let nextWriteId = 0;
  const onWrite = (write: ContractWrite) =>
    write$.next({ id: `${write.id}:${nextWriteId++}`, request: write.request, result: write.result });


  return {
    world,
    worldAddress: networkConfig.worldAddress as Hex,
    components,
    playerEntity: encodeEntity({ address: "address" }, { address: burnerWalletClient.account.address }),
    publicClient,
    walletClient: burnerWalletClient,
    latestBlock$,
    storedBlockLogs$,
    useStore,
    tables,
    waitForTransaction,
    worldContract,
    onWrite,
    write$: write$.asObservable().pipe(share()),
  };
}
