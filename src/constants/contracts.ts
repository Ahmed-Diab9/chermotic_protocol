import { getAllDeployedContracts, deployedAddress } from "@quarkonix/usum";

export const CHAIN = "anvil";

export const DEPLOYED_CONTRACTS = getAllDeployedContracts(CHAIN);

export const DEPLOYED_ADDRESSES = deployedAddress[CHAIN];
