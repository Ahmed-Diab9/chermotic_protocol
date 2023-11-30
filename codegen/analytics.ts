import { gql } from 'graphql-request';

export const CLP_HISTORIES = gql`
  query ClpHistories($start: date!, $end: date!, $address: citext!) {
    lp_value_daily_histories(
      order_by: { date: desc }
      where: { date: { _gte: $start, _lte: $end }, address: { _eq: $address } }
    ) {
      clp_total_supply
      date
      holding_value
      holding_clb_value
      pending_clb_value
      pending_value
    }
  }
`;
