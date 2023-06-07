import {
  IOracleProvider,
  BinMarginStructOutput,
  PositionStructOutput,
} from "@chromatic-protocol/sdk";
import { BigNumber } from "ethers";
import {
  bigNumberify,
  createReducedCollateral,
  expandDecimals,
  formatDecimals,
  withComma,
} from "~/utils/number";
export type {
  PositionStructOutput,
  BinMarginStructOutput,
} from "@chromatic-protocol/sdk";

export class Position {
  id: BigNumber;
  marketAddress: string;
  direction: "long" | "short";
  qty: BigNumber;
  collateral: BigNumber;
  leverage: number;
  takeProfit: number;
  stopLoss: number;
  profitPrice: BigNumber;
  lossPrice: BigNumber;
  toProfitPrice: BigNumber;
  toLossPrice: BigNumber;
  owner: string;
  takerMargin: BigNumber;
  makerMargin: BigNumber;
  openPrice: BigNumber;
  openTimestamp: BigNumber;
  openVersion: BigNumber;
  closePrice: BigNumber;
  closeTimestamp: BigNumber;
  closeVersion: BigNumber;
  currentPrice: BigNumber;
  profitAndLoss: BigNumber;
  constructor(
    output: PositionStructOutput,
    marketAddress: string,
    direction: "long" | "short"
  ) {
    const {
      id,
      qty,
      leverage,
      owner,
      takerMargin,
      openVersion,
      openTimestamp,
      closeVersion,
      closeTimestamp,
      _binMargins,
    } = output;
    this.id = id;
    this.marketAddress = marketAddress;
    this.direction = direction;
    this.qty = qty;
    this.leverage = leverage;
    this.takerMargin = takerMargin;
    this.owner = owner;
    this.openVersion = openVersion;
    this.openTimestamp = openTimestamp;
    this.closeVersion = closeVersion;
    this.closeTimestamp = closeTimestamp;
    this.makerMargin = _binMargins[0].amount;

    this.collateral = bigNumberify(0);
    this.takeProfit = 0;
    this.stopLoss = 0;
    this.profitPrice = bigNumberify(0);
    this.lossPrice = bigNumberify(0);
    this.toProfitPrice = bigNumberify(0);
    this.toLossPrice = bigNumberify(0);
    this.currentPrice = bigNumberify(0);
    this.openPrice = bigNumberify(0);
    this.closePrice = bigNumberify(0);
    this.profitAndLoss = bigNumberify(0);
  }

  // @TODO
  // 이자 차감된 증거금 구하는 메소드
  createCollateral(feeRate: BigNumber) {
    this.collateral = createReducedCollateral(
      this.takerMargin,
      this.openTimestamp,
      feeRate ?? bigNumberify(0)
    );
  }

  // @TODO
  // Take Profit 비율을 구하는 메소드
  createTakeProfit() {
    this.takeProfit = this.makerMargin.div(this.qty).toNumber();
  }

  // @TODO
  // Stop Loss 비율을 구하는 메소드
  createStopLoss() {
    this.stopLoss = this.takerMargin.div(this.qty).toNumber();
  }

  createCurrentPrice(price: BigNumber) {
    this.currentPrice = price;
  }
  createOraclePrice(
    output: [
      IOracleProvider.OracleVersionStructOutput,
      IOracleProvider.OracleVersionStructOutput
    ]
  ) {
    this.openPrice = output[0].price;
    this.closePrice = output[1].price;
  }

  // @TODO
  // 청산가를 구하는 메소드
  createLiquidationPrice(tokenDecimals?: number) {
    const quantity = this.qty.div(expandDecimals(tokenDecimals)).toNumber();
    const takeProfit = this.makerMargin.div(this.qty).toNumber();
    const stopLoss = this.takerMargin.div(this.qty).toNumber();
    const addedProfit =
      this.direction === "long"
        ? quantity + quantity * (takeProfit / 100)
        : quantity - quantity * (takeProfit / 100);
    const addedLoss =
      this.direction === "long"
        ? quantity - quantity * (stopLoss / 100)
        : quantity + quantity * (stopLoss / 100);

    // Profit, Loss가 더해진 Quantity를 진입 시 Quantity로 나눗셈하여 비율 계산
    // 추가 소수점 4자리 적용
    const profitRate = Math.round((addedProfit / quantity) * 10000);
    const lossRate = Math.round((addedLoss / quantity) * 10000);

    // 현재 가격에 비율 곱하여 예상 청산가격을 계산
    this.profitPrice = this.openPrice.mul(profitRate).div(10000);
    this.lossPrice = this.openPrice.mul(lossRate).div(10000);
  }

  // @TODO
  // Profit and Loss를 구하는 메소드
  createPNL(oracleDecimals: number) {
    this.profitAndLoss = this.currentPrice
      .sub(this.openPrice)
      .mul(expandDecimals(oracleDecimals + 2))
      .div(this.openPrice);
  }

  // @TODO
  // 현재 가격에서 각 청산가까지 남은 퍼센트를 구하는 메소드
  createPriceTo(oracleDecimals: number) {
    this.toProfitPrice = this.profitPrice
      .sub(this.currentPrice)
      .mul(expandDecimals(oracleDecimals + 2))
      .div(this.currentPrice);
    this.toLossPrice = this.lossPrice
      .sub(this.currentPrice)
      .mul(expandDecimals(oracleDecimals + 2))
      .div(this.currentPrice);
  }
  renderOpenPrice(oracleDecimals: number) {
    return withComma(formatDecimals(this.openPrice, oracleDecimals, 2));
  }
  renderQty(tokenDecimals?: number) {
    return withComma(formatDecimals(this.qty, tokenDecimals, 2));
  }
  renderCollateral(tokenDecimals?: number) {
    return withComma(formatDecimals(this.collateral, tokenDecimals, 2));
  }
  renderProfitPrice(oracleDecimals: number) {
    return "$" + withComma(formatDecimals(this.profitPrice, oracleDecimals, 2));
  }
  renderLossPrice(oracleDecimals: number) {
    return "$" + withComma(formatDecimals(this.lossPrice, oracleDecimals, 2));
  }
  renderToProfit(oracleDecimals: number) {
    return (
      "+" +
      withComma(formatDecimals(this.toProfitPrice, oracleDecimals, 2)) +
      "% higher"
    );
  }
  renderToLoss(oracleDecimals: number) {
    return (
      withComma(formatDecimals(this.toLossPrice, oracleDecimals, 2)) + "% lower"
    );
  }
  renderPNL(oracleDecimals: number) {
    return (
      withComma(formatDecimals(this.profitAndLoss, oracleDecimals, 2)) + "%"
    );
  }
}
