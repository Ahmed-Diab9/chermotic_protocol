import { Position } from "~/typings/position";
import { bigNumberify } from "~/utils/number";

const positions: Position[] = [
  {
    token: "USDC",
    market: "ETH / USD",
    type: "SHORT",
    entryPrice: bigNumberify(1700),
    quantity: bigNumberify(2000),
    collateral: bigNumberify(2000),
    takeProfit: bigNumberify(10),
    stopLoss: bigNumberify(10),
    profitPrice: bigNumberify(1800),
    lossPrice: bigNumberify(1600),
    profitAndLoss: bigNumberify(15),
    entryTime: bigNumberify(1685006958),
  },
  {
    token: "USDC",
    market: "BTC / USD",
    type: "SHORT",
    entryPrice: bigNumberify(10000),
    quantity: bigNumberify(3000),
    collateral: bigNumberify(3000),
    takeProfit: bigNumberify(40),
    stopLoss: bigNumberify(20),
    profitPrice: bigNumberify(12000),
    lossPrice: bigNumberify(9000),
    profitAndLoss: bigNumberify(30),
    entryTime: bigNumberify(1685006958),
  },
  {
    token: "USDC",
    market: "ETH / USD",
    type: "LONG",
    entryPrice: bigNumberify(1750),
    quantity: bigNumberify(2200),
    collateral: bigNumberify(2200),
    takeProfit: bigNumberify(40),
    stopLoss: bigNumberify(40),
    profitPrice: bigNumberify(2000),
    lossPrice: bigNumberify(1700),
    profitAndLoss: bigNumberify(28),
    entryTime: bigNumberify(1685006958),
  },
  {
    token: "USDC",
    market: "BTC / USD",
    type: "LONG",
    entryPrice: bigNumberify(1750),
    quantity: bigNumberify(2200),
    collateral: bigNumberify(2200),
    takeProfit: bigNumberify(40),
    stopLoss: bigNumberify(40),
    profitPrice: bigNumberify(2000),
    lossPrice: bigNumberify(1700),
    profitAndLoss: bigNumberify(28),
    entryTime: bigNumberify(1685006958),
  },
  {
    token: "USDC",
    market: "LINK / USD",
    type: "SHORT",
    entryPrice: bigNumberify(1750),
    quantity: bigNumberify(2200),
    collateral: bigNumberify(2200),
    takeProfit: bigNumberify(40),
    stopLoss: bigNumberify(40),
    profitPrice: bigNumberify(2000),
    lossPrice: bigNumberify(1700),
    profitAndLoss: bigNumberify(28),
    entryTime: bigNumberify(1685006958),
  },
];

export const createPositionsMock = async () => {
  await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(null!);
    }, 3000);
  });
  return positions;
};
