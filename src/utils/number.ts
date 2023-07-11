import { isNil } from 'ramda';
import { formatUnits } from 'viem';
import { BUFFER_DECIMALS, FEE_RATE_DECIMAL, PERCENT_DECIMALS } from '../configs/decimals';
import { Price, Token } from '../typings/market';
import { isValid } from './valid';

export const abs = (value: bigint | number): bigint => {
  if (typeof value === 'number') value = BigInt(value);
  return value < 0 ? value * -1n : value;
};
export const withComma = (value?: bigint | number | string, replace?: string) => {
  const seperator = /\B(?=(\d{3})+(?!\d))/g;
  if (value === undefined) {
    return replace;
  }
  if (typeof value === 'number') {
    const [integer, decimals] = String(value).split('.') as [string, string | undefined];
    return String(integer).replace(seperator, ',') + (isValid(decimals) ? `.${decimals}` : '');
  }
  if (typeof value === 'string') {
    const [integer, decimals] = value.split('.');
    return integer.replace(seperator, ',') + (isValid(decimals) ? `.${decimals}` : '');
  }
  if (typeof value === 'bigint') {
    const [integer, decimals] = value.toString().split('.');
    return integer.replace(seperator, ',') + (isValid(decimals) ? `.${decimals}` : '');
  }
};

export const applyDecimals = (value: bigint | number | string | boolean, decimals: number) => {
  const multiplicand = BigInt(10) ** BigInt(decimals);
  if (typeof value === 'number') {
    return BigInt(value) * multiplicand;
  }

  const multiplier = BigInt(value);
  return multiplier ** multiplicand;
};

export const trimDecimals = (
  value: bigint | number | string | boolean,
  decimals: number
): bigint => {
  const multiplicand = BigInt(10) ** BigInt(decimals);
  return BigInt(value ?? 0) / multiplicand;
};

export const formatDecimals = (
  value?: bigint | number | string | boolean,
  tokenDecimals?: number,
  decimalLimit?: number
) => {
  if (isNil(value)) return '0';
  const formatted = formatUnits(BigInt(value), tokenDecimals ?? 0);
  const [numeric, decimals] = formatted.split('.');
  const point = isValid(decimalLimit) && decimalLimit !== 0 ? '.' : '';
  if (!isValid(decimals)) {
    return numeric + '.00';
  }
  if (isValid(decimalLimit) && decimals.length >= decimalLimit) {
    return numeric + point + decimals.slice(0, decimalLimit);
  }
  if (isValid(decimalLimit) && decimals.length < decimalLimit) {
    const padLength = numeric.length + 1 + decimalLimit;
    return formatted.padEnd(padLength, '0');
  }
};

export const expandDecimals = (decimals?: number) => {
  return 10n ** BigInt(decimals || 0n);
};

export const formatBalance = (balance: bigint, token: Token, price: Price) => {
  return (balance * price.value || 0n) / expandDecimals(token.decimals) / expandDecimals(price.decimals);
};

export const formatFeeRate = (feeRate: number) => {
  const percentage = (feeRate / Math.pow(10, FEE_RATE_DECIMAL)) * 100;
  const plus = percentage > 0 ? '+' : '';
  if (Math.abs(percentage) >= 10) {
    const endIndex = percentage > 0 ? 2 : 3;
    const converted = percentage.toFixed(endIndex);
    return plus + converted.slice(0, endIndex);
  }
  if (Math.abs(percentage) >= 1) {
    const endIndex = percentage > 0 ? 1 : 2;
    const converted = percentage.toFixed(endIndex);
    return plus + converted.slice(0, endIndex);
  }
  if (Math.abs(percentage) >= 0.1) {
    const converted = percentage.toFixed(2);
    const [integer, decimals] = converted.split('.');
    return plus + integer + '.' + decimals[0];
  }
  const converted = percentage.toFixed(2);
  const [integer, decimals] = converted.split('.');
  return plus + integer + '.' + decimals.slice(0, 2);
};

export const trimLeftZero = (rawString: string) => {
  let firstIndex = 0;
  for (let index = 0; index < rawString.length; index++) {
    if (rawString[index] !== '0') {
      firstIndex = index;
      break;
    }
  }

  return rawString.substring(firstIndex);
};

export const createAnnualSeconds = (time: Date | number, ms?: boolean) => {
  if (typeof time === 'number') {
    time = new Date(time);
  }
  const startTime = time.getTime();
  const endTime = time.setFullYear(time.getFullYear() + 1);
  const subtraction = endTime - startTime;
  if (ms) {
    return subtraction / 1000;
  }
  return subtraction;
};

export const percentage = () => {
  return 10 ** PERCENT_DECIMALS;
};

export const numberBuffer = (decimals: number = BUFFER_DECIMALS) => {
  return 10 ** decimals;
};
