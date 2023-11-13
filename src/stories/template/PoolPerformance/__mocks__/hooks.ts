import cETH from '~/assets/tokens/cETH.svg';

const formattedPeriods = ['A week', 'A month', '3 months', '6 months', 'A year', 'All time'];

export const usePoolPerformance = () => {
  return {
    tokenName: 'cETH',
    tokenImage: cETH,
    performance: '13.526',
    trailingApr: '7.54',
    formattedPeriods,
    period: formattedPeriods[0],
  };
};
