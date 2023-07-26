import { isNil } from 'ramda';
import { formatUnits, parseUnits } from 'viem';
import { BUFFER_DECIMALS, FEE_RATE_DECIMAL, PERCENT_DECIMALS } from '../configs/decimals';
import { Price, Token } from '../typings/market';
import { isValid } from './valid';

export const abs = (value: bigint | number): bigint => {
  if (typeof value === 'number') value = BigInt(value);
  return value < 0 ? value * -1n : value;
};

export const padTimeZero = (value: number) => {
  return value > 10 ? String(value) : `0${value}`;
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

export const formatDecimals = (
  value?: bigint | number | string | boolean,
  tokenDecimals?: number,
  decimalLimit?: number,
  useGrouping?: boolean
) => {
  const formatter = Intl.NumberFormat('en', {
    maximumFractionDigits: decimalLimit,
    minimumFractionDigits: decimalLimit,
    useGrouping: isValid(useGrouping) ? useGrouping : false,
  });
  if (isNil(value)) return '0';
  const formatted = formatUnits(BigInt(value), tokenDecimals ?? 0);
  const [numeric, decimals] = formatted.split('.');
  const point = isValid(decimalLimit) && decimalLimit !== 0 ? '.' : '';
  if (!isValid(decimals)) {
    return formatter.format(Number(numeric));
  }
  if (isValid(decimalLimit) && decimals.length >= decimalLimit) {
    const trimmed = numeric + point + decimals.slice(0, decimalLimit);
    return formatter.format(Number(trimmed));
  }
  if (isValid(decimalLimit) && decimals.length < decimalLimit) {
    const padLength = numeric.length + 1 + decimalLimit;
    const padded = formatted.padEnd(padLength, '0');
    return formatter.format(Number(padded));
  }
};

export const formatBalance = (balance: bigint, token: Token, price: Price) => {
  return (
    (balance * price.value || 0n) /
    parseUnits('1', token.decimals) /
    parseUnits('1', price.decimals)
  );
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
  const [integer, decimals = undefined] = rawString.split('.');
  let firstIndex = 0;
  for (let index = 0; index < integer.length; index++) {
    if (integer[index] !== '0') {
      firstIndex = index;
      break;
    }
  }

  if (isValid(decimals)) {
    return integer.substring(firstIndex) + '.' + decimals;
  } else {
    return integer.substring(firstIndex);
  }
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

export const decimalLength = (num: number | string, length: number, fix: boolean = false) => {
  if (isNaN(+num)) return num.toString();
  const [integer, decimals = ''] = String(+num).split('.');
  const result =
    decimals.length > 0
      ? `${integer}.${decimals.slice(0, length)}`
      : fix
      ? `${integer}.${'0'.repeat(length)}`
      : `${integer}`;
  return result;
};

export const divPreserved = (numerator: bigint, denominator: bigint, decimals: number) => {
  return (numerator * 10n ** BigInt(decimals)) / denominator;
};

export const mulPreserved = (value: bigint, numerator: bigint, decimals: number) => {
  return (value * numerator) / 10n ** BigInt(decimals);
};

export const toBigintWithDecimals = (value: number | string | bigint, decimals: number) => {
  const formatter = Intl.NumberFormat('en', {
    maximumFractionDigits: decimals,
    useGrouping: false,
  });
  return parseUnits(parseFloat(formatter.format(Number(value))).toString(), decimals);
};

export const toBigInt = (value: number | string) => {
  return toBigintWithDecimals(value, 0);
};
