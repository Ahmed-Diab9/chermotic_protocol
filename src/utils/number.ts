import { BigNumber, BigNumberish } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { isValid } from "./valid";
import { Price, Token } from "../typings/market";
import { FEE_RATE_DECIMAL } from "../configs/feeRate";

interface BigNumberify {
  (value: number): BigNumber;
  (value: unknown): BigNumber | undefined;
}
export const bigNumberify: BigNumberify = (value) => {
  if (typeof value === "number") {
    return BigNumber.from(value);
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
    const [integer, decimal] = String(value).split(".");
    return String(integer).replace(seperator, ",") + (decimal ?? "");
  }
  if (typeof value === "string") {
    const [integer, decimal] = value.split(".");
    return integer.replace(seperator, ",") + (decimal ?? "");
  }
  if (value instanceof BigNumber) {
    const [integer, decimal] = value.toString().split(".");
    return integer.replace(seperator, ",") + (decimal ?? "");
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
  if (!isValid(decimals)) {
    return numeric;
  }
  if (isValid(decimalLimit) && decimals.length >= decimalLimit) {
    return numeric + "." + decimals.slice(0, decimalLimit);
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
  price?: Price
) => {
  return balance
    .mul(price?.value ?? 1)
    .div(expandDecimals(token.decimals))
    .div(expandDecimals(price?.decimals));
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
