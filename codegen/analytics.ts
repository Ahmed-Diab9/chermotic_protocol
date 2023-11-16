import { gql } from 'graphql-request';

export const CLP_HISTORIES = gql`
  query ClpHistories($start: numeric!, $end: numeric!, $address: citext!) {
    lp_value_histories(
      order_by: { block_timestamp: desc }
      where: { block_timestamp: { _gte: $start, _lte: $end }, address: { _eq: $address } }
    ) {
      clp_total_supply
      block_timestamp
      holding_value
      holding_clb_value
      pending_clb_value
      pending_value
    }
  }
`;
