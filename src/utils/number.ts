import { BigNumber } from "ethers";

interface BigNumberify {
  (value: number): BigNumber;
  (value: unknown): BigNumber | undefined;
}
export const bigNumberify: BigNumberify = (value: number): BigNumber => {
  if (typeof value === "number") {
    return BigNumber.from(value);
  }
  try {
    return BigNumber.from(value);
  } catch (error) {
    return;
  }
};
