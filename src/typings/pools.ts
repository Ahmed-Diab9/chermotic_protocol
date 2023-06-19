import { CLBToken, ChromaticLens } from "@chromatic-protocol/sdk";
import { BigNumber } from "ethers";
import { BIN_VALUE_DECIMAL } from "~/configs/decimals";
import { filterIfFulfilled } from "~/utils/array";
import { expandDecimals, percentage } from "~/utils/number";

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

  async updateMetadata() {
    const promise = this.feeRates.map(async (rate) => {
      const name = await this.clb.name(rate);
      const image = await this.clb.image(rate);
      const description = await this.clb.description(rate);

      /**
       * FIXME
       * CLB Decimals should be fixed.
       * const decimals = await clbToken.decimals();
       */
      const decimals = await this.clb.decimals();

      return {
        name,
        image,
        description,
        decimals,
      } satisfies CLBTokenMetadata;
    });

    this.metadata = await filterIfFulfilled(promise);
  }

  async updateBalances(walletAddress: string) {
    const walletAddresses = this.feeRates.map(() => walletAddress);
    this.balances = await this.clb.balanceOfBatch(
      walletAddresses,
      this.feeRates
    );
  }

  async updateLiquidities() {
    const response = await this.lens.liquidityBinStatuses(this.marketAddress);
    const liquidities = [] as BigNumber[];
    const freeLiquidiries = [] as BigNumber[];
    const binValues = [] as BigNumber[];
    for (let index = 0; index < response.length; index++) {
      liquidities.push(response[index].liquidity);
      freeLiquidiries.push(response[index].freeLiquidity);

      const liquidity = response[index].liquidity.gt(0)
        ? response[index].liquidity
        : 1;

      /**
       * TODO
       * 현재 Bin의 가치 계산 방법
       * 각 Response의 Bin Value를 Liquidity로 나눗셈
       * Bin Value Decimals 적용
       */
      const binValue = response[index].binValue
        .mul(expandDecimals(BIN_VALUE_DECIMAL))
        .div(liquidity);
      binValues.push(binValue);
    }

    this.liquidities = liquidities;
    this.freeLiquidities = freeLiquidiries;
    this.binValues = binValues;
  }

  updateLiquidityValues() {
    const values = [] as BigNumber[];
    for (let index = 0; index < this.batchLength; index++) {
      const balance = this.balances[index];
      const binValue = this.binValues[index];
      const value = balance
        .mul(binValue)
        .div(expandDecimals(BIN_VALUE_DECIMAL));
      values.push(value);
    }
    this.liquidityValues = values;
  }

  updateRemovableRates() {
    const rates = [] as number[];
    for (let index = 0; index < this.batchLength; index++) {
      const liquidityValue = this.liquidityValues[index];
      const freeLiquidity = this.freeLiquidities[index];
      const denominator = liquidityValue.eq(0) ? 1 : liquidityValue;

      const rate = freeLiquidity.mul(percentage()).div(denominator);
      rates.push(rate.toNumber());
    }
    this.removableRates = rates;
  }

  toBins() {
    const bins = [] as Bin[];
    for (let index = 0; index < this.batchLength; index++) {
      bins.push(
        new Bin(
          this.metadata[index],
          this.baseFeeRates[index],
          this.feeRates[index],
          this.binValues[index],
          this.liquidities[index],
          this.freeLiquidities[index],
          this.balances[index],
          this.liquidityValues[index],
          this.removableRates[index]
        )
      );
    }
    return bins;
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
