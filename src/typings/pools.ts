import { BigNumber } from "ethers";

export interface LPToken {
  id: BigNumber;
  quantity: BigNumber;
  slotValue: BigNumber;
  myLiqValue: BigNumber;
  earningRate: BigNumber;
}
