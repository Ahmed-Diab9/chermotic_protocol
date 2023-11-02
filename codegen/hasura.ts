import { gql } from 'graphql-request';

export const GET_PRICEFEED = gql`
query GetPriceFeed($symbol: String!, $begin: numeric!, $end: numeric!, $interval: numeric!) {
  chainlink_pricefeed(
    args: { 
      symbol: $symbol,
      begin_timestamp: $begin,
      end_timestamp: $end,
      period_interval: $interval 
    }
    distinct_on: [closing_block_number]
  ) {
    closing_price
    high_price
    low_price
    opening_price
    period
    opening_block_timestamp
  }
}
`;
