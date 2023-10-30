import { gql } from 'graphql-request';

export const GET_ORACLE_PRICE = gql`
  query GetOraclePrice($symbol: String!, $time: BigInt!) {
    lastTwo: answerUpdateds(
      first: 2
      orderBy: blockTimestamp
      orderDirection: desc
      where: { symbol: $symbol }
    ) {
      current
      blockTimestamp
      roundId
    }
    previous: answerUpdateds(
      first: 1
      where: { blockTimestamp_lte: $time, symbol: $symbol }
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      current
      blockTimestamp
      roundId
    }
  }
`;

export const GET_ROUND_UPDATES = gql`
  subscription GetRoundUpdates($symbol: String!) {
    answerUpdateds(first: 1, orderBy: roundId, orderDirection: desc, where: { symbol: $symbol }) {
      current
      blockTimestamp
      roundId
      symbol
    }
  }
`;
