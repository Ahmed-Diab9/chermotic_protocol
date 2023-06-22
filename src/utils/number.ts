import { BigNumber, BigNumberish } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { isValid } from "./valid";
import { Price, Token } from "../typings/market";
import {
  BUFFER_DECIMALS,
  FEE_RATE_DECIMAL,
  PERCENT_DECIMALS,
} from "../configs/decimals";

interface BigNumberify {
  (value: number): BigNumber;
  (value: BigNumber): BigNumber;
  (value: unknown): BigNumber | undefined;
}
export const bigNumberify: BigNumberify = (value) => {
  if (typeof value === "number") {
    return BigNumber.from(value);
  }
  if (value instanceof BigNumber) {
    return value;
  }
  try {
    return BigNumber.from(value);
  } catch (error) {
    return undefined!;
  }
};

export const withComma = (
  value?: number | string | BigNumber,
  replace?: string
) => {
  const seperator = /\B(?=(\d{3})+(?!\d))/g;
  if (value === undefined) {
    return replace;
  }
  if (typeof value === "number") {
    const [integer, decimals] = String(value).split(".") as [
      string,
      string | undefined
    ];
    return (
      String(integer).replace(seperator, ",") +
      (isValid(decimals) && decimals.length > 0 ? `.${decimals}` : "")
    );
  }
  if (typeof value === "string") {
    const [integer, decimals] = value.split(".");
    return (
      integer.replace(seperator, ",") +
      (isValid(decimals) && decimals.length > 0 ? `.${decimals}` : "")
    );
  }
  if (value instanceof BigNumber) {
    const [integer, decimals] = value.toString().split(".");
    return (
      integer.replace(seperator, ",") +
      (isValid(decimals) && decimals.length > 0 ? `.${decimals}` : "")
    );
  }
};

export const applyDecimals = (value: BigNumberish, decimals: number) => {
  const multiplicand = bigNumberify(10).pow(decimals);
  if (typeof value === "number") {
    return bigNumberify(value).mul(multiplicand);
  }

  const multiplier = bigNumberify(value);
  return multiplier?.mul(multiplicand);
};

export const formatDecimals = (
  value: BigNumberish,
  tokenDecimals?: number,
  decimalLimit?: number
) => {
  const formatted = formatUnits(value, tokenDecimals);
  const [numeric, decimals] = formatted.split(".");
  const point = isValid(decimalLimit) && decimalLimit !== 0 ? "." : "";
  if (!isValid(decimals)) {
    return numeric;
  }
  if (isValid(decimalLimit) && decimals.length >= decimalLimit) {
    return numeric + point + decimals.slice(0, decimalLimit);
  }
  if (isValid(decimalLimit) && decimals.length < decimalLimit) {
    const padLength = numeric.length + 1 + decimalLimit;
    return formatted.padEnd(padLength, "0");
  }
};

export const expandDecimals = (decimals?: number) => {
  return BigNumber.from(10).pow(decimals ?? 0);
};

export const formatBalance = (
  balance: BigNumber,
  token: Token,
  price: Price
) => {
  return balance.mul(price.value).div(expandDecimals(token.decimals)).div(expandDecimals(price.decimals));
};

export const formatFeeRate = (feeRate: number) => {
  const percentage = (feeRate / Math.pow(10, FEE_RATE_DECIMAL)) * 100;
  const converted = percentage.toString();
  const plus = percentage > 0 ? "+" : "";
  if (Math.abs(percentage) >= 10) {
    const endIndex = percentage > 0 ? 2 : 3;
    return plus + converted.slice(0, endIndex);
  }
  if (Math.abs(percentage) >= 1) {
    const endIndex = percentage > 0 ? 1 : 2;
    return plus + converted.slice(0, endIndex);
  }
  if (Math.abs(percentage) >= 0.1) {
    const [integer, decimals] = converted.split(".");
    return plus + integer + "." + decimals[0];
  }
  const [integer, decimals] = converted.split(".");
  return plus + integer + "." + decimals.slice(0, 2);
};

export const trimLeftZero = (rawString: string) => {
  let firstIndex = 0;
  for (let index = 0; index < rawString.length; index++) {
    if (rawString[index] !== "0") {
      firstIndex = index;
      break;
    }
  }

  return rawString.substring(firstIndex);
};

export const createAnnualSeconds = (time: Date | number, ms?: boolean) => {
  if (typeof time === "number") {
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
