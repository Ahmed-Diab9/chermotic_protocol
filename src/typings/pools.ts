import { CLBToken, ChromaticLens } from "@chromatic-protocol/sdk";
import { BigNumber } from "ethers";
import { BIN_VALUE_DECIMAL } from "~/configs/decimals";
import { filterIfFulfilled } from "~/utils/array";
import { bigNumberify, expandDecimals, percentage } from "~/utils/number";

export class CLBTokenBatch {
  clb: CLBToken;
  lens: ChromaticLens;

  address: string;
  batchLength: number;
  tokenAddress: string;
  marketAddress: string;
  metadata: CLBTokenMetadata[];
  baseFeeRates: number[];
  feeRates: BigNumber[];
  binValues: BigNumber[];
  liquidities: BigNumber[];
  freeLiquidities: BigNumber[];

  balances: BigNumber[];
  liquidityValues: BigNumber[];
  removableRates: number[];

  constructor(
    clb: CLBToken,
    lens: ChromaticLens,
    address: string,
    tokenAddress: string,
    marketAddress: string,
    baseFeeRates: number[],
    feeRates: BigNumber[]
  ) {
    this.clb = clb;
    this.lens = lens;
    this.address = address;
    this.tokenAddress = tokenAddress;
    this.marketAddress = marketAddress;
    this.baseFeeRates = baseFeeRates;
    this.feeRates = feeRates;
    this.batchLength = feeRates.length;

    this.metadata = [];
    this.binValues = [];
    this.liquidities = [];
    this.freeLiquidities = [];
    this.balances = [];
    this.liquidityValues = [];
    this.removableRates = [];
  }

}

export class Bin implements CLBTokenMetadata {
  name: string;
  description: string;
  image: string;
  decimals: number;
  baseFeeRate: number;
  feeRate: BigNumber;
  binValue: BigNumber;
  liquidity: BigNumber;
  freeLiquidity: BigNumber;

  balance: BigNumber;
  liquidityValue: BigNumber;
  removableRate: number;

  constructor(
    metadata: CLBTokenMetadata,
    baseFeeRate: number,
    feeRate: BigNumber,
    binValue: BigNumber,
    liquidity: BigNumber,
    freeLiquidity: BigNumber,
    balance: BigNumber,
    liquidityValue: BigNumber,
    removableRate: number
  ) {
    const { name, description, image, decimals } = metadata;
    this.name = name;
    this.description = description;
    this.image = image;
    this.decimals = decimals;
    this.baseFeeRate = baseFeeRate;
    this.feeRate = feeRate;
    this.binValue = binValue;
    this.liquidity = liquidity;
    this.freeLiquidity = freeLiquidity;

    this.balance = balance;
    this.liquidityValue = liquidityValue;
    this.removableRate = removableRate;
  }
}

export interface LiquidityPool {
  address: string;
  tokenAddress: string;
  marketAddress: string;
  bins: Bin[];
}

export interface CLBTokenMetadata {
  name: string;
  description: string;
  image: string;
  decimals: number;
}

export interface LiquidityPoolSummary {
  token: { name: string; decimals: number };
  market: string;
  liquidity: BigNumber;
  bins: number;
  thumbnail?: string;
}

export type ADD_LIQUIDITY_STATUS = "IDLE" | "PENDING" | "FINISHED";
export type REMOVE_LIQUIDITY_STATUS = "IDLE" | "PENDING" | "FINISHED";
