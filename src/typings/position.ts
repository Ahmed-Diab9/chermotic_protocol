import { IOracleProvider, PositionStructOutput } from "@chromatic-protocol/sdk";
import { BigNumber } from "ethers";
import {
  bigNumberify,
  createAnnualSeconds,
  expandDecimals,
  formatDecimals,
  numberBuffer,
  withComma,
} from "~/utils/number";
import { isValid } from "~/utils/valid";
import { OracleVersion } from "./oracleVersion";
import { PERCENT_DECIMALS } from "~/configs/decimals";
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
  constructor(output: PositionStructOutput, marketAddress: string) {
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
    this.direction = qty.gt(0) ? "long" : "short";
    this.qty = qty;
    this.leverage = leverage;
    this.takerMargin = takerMargin;
    this.collateral = takerMargin;
    this.owner = owner;
    this.openVersion = openVersion;
    this.openTimestamp = openTimestamp;
    this.closeVersion = closeVersion;
    this.closeTimestamp = closeTimestamp;
    this.makerMargin = _binMargins.reduce(
      (totalMargin, currentBin) => totalMargin.add(currentBin?.amount || 0),
      bigNumberify(0)
    );

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

  // TODO
  // 이자 차감된 증거금 구하는 메소드
  // 시간이 지남에 따른 보증금 차감 로직이 유효한지 검증이 필요합니다.
  // 추가 Decimals 20 적용 - 초당 토큰 수수료 10 + 보증금 차감 10
  createCollateral(feeRate: BigNumber) {
    // entryTime: 진입시각
    const entryTime = this.openTimestamp.toNumber();
    // annualSeconds: 현재 시각부터 1년 뒤 시각까지의 차이를 초 단위로 변환된 값
    const annualSeconds = createAnnualSeconds(entryTime);
    // subtraction: 현재 시각에서 포지션 진입 시각을 뺀 값
    const subtraction = (Date.now() - entryTime * 1000) / 1000;
    // progressRate: 1년 동안 시간(초)이 얼마나 지났는지 나타내는 비율
    const prograssRate = subtraction / annualSeconds;

    // 초당 토큰 수수료 = 포지션 증거금 * (연이율을 초 단위로 변환한 값)
    // FIXME @austin-builds 언더플로우 대처가 필요함
    const tokenFeeBasis = this.collateral.mul(
      feeRate.mul(expandDecimals(10)).div(annualSeconds)
    );

    // 진입 시 증거금에서 초당 토큰 수수료에 진행률을 곱한 값
    this.collateral = this.collateral
      .mul(expandDecimals(20))
      .sub(tokenFeeBasis.mul(Math.round(10 ** 10 * prograssRate)))
      .div(expandDecimals(20));
  }

  // TODO
  // Take Profit 비율을 구하는 메소드
  createTakeProfit() {
    this.takeProfit = this.makerMargin.div(this.qty.abs()).toNumber();
  }

  // TODO
  // Stop Loss 비율을 구하는 메소드
  createStopLoss() {
    this.stopLoss = this.takerMargin.div(this.qty.abs()).toNumber();
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

  // TODO
  // 청산가를 구하는 메소드
  createLiquidationPrice(tokenDecimals?: number) {
    const quantity = this.qty
      .abs()
      .div(expandDecimals(tokenDecimals))
      .toNumber();
    const takeProfit = this.makerMargin.div(this.qty.abs()).toNumber();
    const stopLoss = this.takerMargin.div(this.qty.abs()).toNumber();
    const addedProfit =
      this.direction === "long"
        ? quantity + quantity * (takeProfit / 100)
        : quantity - quantity * (takeProfit / 100);
    const addedLoss =
      this.direction === "long"
        ? quantity - quantity * (stopLoss / 100)
        : quantity + quantity * (stopLoss / 100);

    // Profit, Loss가 더해진 Quantity를 진입 시 Quantity로 나눗셈하여 비율 계산
    // 추가 소수점 5 적용
    const decimals = 5;
    const profitRate = Math.round(
      (addedProfit / quantity) * numberBuffer(decimals)
    );
    const lossRate = Math.round(
      (addedLoss / quantity) * numberBuffer(decimals)
    );

    // 현재 가격에 비율 곱하여 예상 청산가격을 계산
    this.profitPrice = this.openPrice
      .mul(profitRate)
      .div(numberBuffer(decimals));
    this.lossPrice = this.openPrice.mul(lossRate).div(numberBuffer(decimals));
  }

  // TODO
  // Profit and Loss를 구하는 메소드
  createPNL(oracleDecimals: number) {
    this.profitAndLoss = this.currentPrice
      .sub(this.openPrice)
      .mul(expandDecimals(oracleDecimals + 2))
      .mul(this.direction === "long" ? 1 : -1)
      .div(this.openPrice);
  }

  // TODO
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
  addProfitAndLoss(oracleDecimals: number) {
    return this.collateral
      .mul(this.profitAndLoss)
      .div(expandDecimals(oracleDecimals))
      .div(expandDecimals(PERCENT_DECIMALS));
  }

  renderOpenPrice(oracleDecimals: number) {
    return withComma(formatDecimals(this.openPrice, oracleDecimals, 2));
  }
  renderQty(tokenDecimals?: number) {
    return withComma(formatDecimals(this.qty, 4, 2));
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
    const toProfit = withComma(
      formatDecimals(this.toProfitPrice, oracleDecimals, 2)
    );
    if (this.direction === "long") {
      return "+" + toProfit + "% higher";
    } else {
      return toProfit + "% lower";
    }
  }
  renderToLoss(oracleDecimals: number) {
    const toLoss = withComma(
      formatDecimals(this.toLossPrice, oracleDecimals, 2)
    );
    if (this.direction === "long") {
      return toLoss + "% lower";
    } else {
      return "+" + toLoss + "% higher";
    }
  }
  renderPNL(oracleDecimals: number) {
    const prefix = this.profitAndLoss.gt(0) ? "+" : "";
    return (
      prefix +
      withComma(formatDecimals(this.profitAndLoss, oracleDecimals, 2)) +
      "%"
    );
  }
  isClaimable(oracleVersions?: Record<string, OracleVersion>) {
    if (!isValid(oracleVersions)) {
      return false;
    }
    const isClosed = !this.closeVersion.eq(0);
    return (
      isClosed &&
      this.closeVersion.lt(oracleVersions[this.marketAddress].version)
    );
  }
}
