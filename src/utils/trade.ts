import { FEE_RATE_DECIMAL } from '../configs/decimals';
import { Bin } from '../typings/pools';
import { errorLog } from './log';
import { abs, divFloat, mulFloat, mulPreserved } from './number';

export function calculateMakerMargin(
  takerMargin: bigint,
  lossCutRate: number,
  takeProfitRate: number
): bigint {
  return mulFloat(divFloat(takerMargin, lossCutRate), takeProfitRate);
}

export function calculateTradingFee(makerMargin: bigint, bins: Bin[]): bigint {
  const { tradingFee } = bins.reduce(
    (acc, cur) => {
      if (acc.makerMargin > 0n) {
        const feeRate = abs(cur.baseFeeRate);

        if (acc.makerMargin >= cur.freeLiquidity) {
          acc.tradingFee += mulPreserved(cur.freeLiquidity, feeRate, FEE_RATE_DECIMAL);
          acc.makerMargin = acc.makerMargin - cur.freeLiquidity;
        } else {
          acc.tradingFee += mulPreserved(acc.makerMargin, feeRate, FEE_RATE_DECIMAL);
          acc.makerMargin = 0n;
        }
      }
      return acc;
    },
    { tradingFee: 0n, makerMargin }
  );

  return tradingFee;
}

function errorRate(transactionAmount: bigint, balance: bigint): number {
  return Number(balance - transactionAmount) / Number(balance);
}

export function findMaxAllowableTakerMargin(
  balance: bigint,
  minimumMargin: bigint,
  lossCutRate: number,
  takeProfitRate: number,
  bins: Bin[],
  toleranceRate = 0.1,
  iterate = 10
): bigint {
  const minMakerMargin = calculateMakerMargin(minimumMargin, lossCutRate, takeProfitRate);
  const minTradingFee = calculateTradingFee(minMakerMargin, bins);
  if (balance < minimumMargin + minTradingFee) {
    errorLog('insufficient balance');

    const remainedBalance = balance - minTradingFee;
    return remainedBalance > 0n ? remainedBalance : 0n;
  }

  const boundary = { min: minimumMargin, max: balance };
  for (let i = 0; i < iterate; i++) {
    const candidate = (boundary.min + boundary.max) / 2n;
    const makerMargin = calculateMakerMargin(candidate, lossCutRate, takeProfitRate);
    const tradingFee = calculateTradingFee(makerMargin, bins);
    const transactionAmount = candidate + tradingFee;

    if (transactionAmount <= balance && errorRate(transactionAmount, balance) <= toleranceRate) {
      return candidate;
    }

    if (transactionAmount > balance) {
      boundary.max = candidate;
    } else {
      boundary.min = candidate;
    }
  }

  return boundary.min;
}
