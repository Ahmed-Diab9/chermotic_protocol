import { BigNumber } from "ethers";

export interface OracleVersion {
  version: BigNumber;
  timestamp: BigNumber;
  price: BigNumber;
}
