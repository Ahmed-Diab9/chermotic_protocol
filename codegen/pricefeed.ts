import { gql } from 'graphql-request';

export const GET_CANDLE_STICK = gql`
query GetCandleStick($from: BigInt = 1697414400, $to: BigInt = 1697500800) {
  open: answerUpdateds(
    first: 1
    where: { blockTimestamp_gt: $from, blockTimestamp_lte: $to }
    orderBy: blockTimestamp
    orderDirection: asc
  ) {
    current
    blockTimestamp
  }
  close: answerUpdateds(
    first: 1
    where: { blockTimestamp_gt: $from, blockTimestamp_lte: $to }
    orderBy: updatedAt
    orderDirection: desc
  ) {
    current
    blockTimestamp
  }
  high: answerUpdateds(
    first: 1
    where: { blockTimestamp_gt: $from, blockTimestamp_lte: $to }
    orderBy: current
    orderDirection: desc
  ) {
    current
    blockTimestamp
  }
  low: answerUpdateds(
    first: 1
    where: { blockTimestamp_gt: $from, blockTimestamp_lte: $to }
    orderBy: current
    orderDirection: asc
  ) {
    current
    blockTimestamp
  }
}
`;