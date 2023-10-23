import { gql } from 'graphql-request';

export const GET_PRICE_BEFORE = gql`
  query GetPriceBefore($time: BigInt!) {
    price: answerUpdateds(
      first: 1
      where: { blockTimestamp_lte: $time }
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      current
      blockTimestamp
    }
  }
`;
