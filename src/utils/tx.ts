import { ContractTransaction } from "ethers";

export const handleTx = async (
  tx: ContractTransaction,
  ...functions: (() => Promise<unknown>)[]
) => {
  await tx.wait();

  for (let index = 0; index < functions.length; index++) {
    await functions[index]();
  }
};
