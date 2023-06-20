import { getAllDeployedContracts, deployedAddress } from "@chromatic-protocol/sdk/contracts";

export const CHAIN = "anvil";

export const DEPLOYED_CONTRACTS = getAllDeployedContracts(CHAIN);

export const DEPLOYED_ADDRESSES = deployedAddress[CHAIN];
