import { gql } from 'graphql-request';

export const LP_PERFORMANCES = gql`
  query LPPerformancesByPk($address: citext!, $date: date!) {
    lp_performances_by_pk(address: $address, date: $date) {
      address
      date
      rate_all
      rate_d180
      rate_d30
      rate_d365
      rate_d7
      rate_d90
    }
  }
`;
