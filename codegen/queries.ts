import { gql } from '@apollo/client';

export const ADD_LIQUIDITIES = gql(`
query AddLiquidities(
  $count: Int!
  $orderBy: AddLiquidity_orderBy!
  $orderDirection: OrderDirection!
  $walletAddress: Bytes!
  $lpAddress: Bytes!
  $toBlockTimestamp: BigInt
) {
  addLiquidities(
    orderDirection: $orderDirection
    orderBy: $orderBy
    where: { lp: $lpAddress, recipient: $walletAddress, blockTimestamp_lt: $toBlockTimestamp }
    first: $count
  ) {
    id
    lp
    receiptId
    recipient
    oracleVersion
    amount
    blockNumber
    blockTimestamp
    transactionHash
  }
}`);

export const ADD_LIQUIDITY_SETTLEDS = gql(`
query AddLiquiditySettleds($fromId: BigInt!, $endId: BigInt!, $lpAddress: Bytes!) {
  addLiquiditySettleds(where: { receiptId_gt: $fromId, receiptId_lt: $endId, lp: $lpAddress }) {
    id
    lp
    receiptId
    settlementAdded
    lpTokenAmount
    blockNumber
    blockTimestamp
    transactionHash
  }
}
`);

export const REMOVE_LIQUIDITIES = gql(`
query RemoveLiquidities(
  $count: Int!
  $orderBy: RemoveLiquidity_orderBy!
  $orderDirection: OrderDirection!
  $walletAddress: Bytes!
  $lpAddress: Bytes!
  $toBlockTimestamp: BigInt
) {
  removeLiquidities(
    orderDirection: $orderDirection
    orderBy: $orderBy
    where: { lp: $lpAddress, recipient: $walletAddress, blockTimestamp_lt: $toBlockTimestamp }
    first: $count
  ) {
    id
    lp
    receiptId
    recipient
    oracleVersion
    lpTokenAmount
    blockNumber
    blockTimestamp
    transactionHash
  }
}`);

export const REMOVE_LIQUIDITY_SETTLEDS = gql(`
query RemoveLiquiditySettleds($fromId: BigInt!, $endId: BigInt!, $lpAddress: Bytes!) {
  removeLiquiditySettleds(where: { receiptId_gt: $fromId, receiptId_lt: $endId, lp: $lpAddress }) {
    id
    lp
    receiptId
    burningAmount
    witdrawnSettlementAmount
    refundedAmount
    blockNumber
    blockTimestamp
    transactionHash
  }
}
`);
