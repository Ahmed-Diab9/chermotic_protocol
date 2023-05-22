import { getAllDeployedContracts, getDeployedAddress } from "@quarkonix/usum";

export const CHAIN = "anvil";

export const DEPLOYED_CONTRACTS = getAllDeployedContracts(CHAIN);

export const DEPLOYED_ADDRESSES: { [title: string]: string } = Object.keys(
  DEPLOYED_CONTRACTS
).reduce((acc, contractName) => {
  acc[contractName] = getDeployedAddress(contractName, CHAIN);
  return acc;
}, {});
