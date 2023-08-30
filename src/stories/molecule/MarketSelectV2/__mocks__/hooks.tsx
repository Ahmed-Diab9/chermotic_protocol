export function useMarketSelectV2() {
  const isLoading = false;

  const tokenName = 'CHRM';
  const marketDescription = 'ETH/USD';

  const tokens = [{ key: 0, isSelectedToken: true, onClickToken: () => {}, name: 'CHRM' }];

  const markets = [
    {
      key: 0,
      isSelectedMarket: true,
      onClickMarket: () => {},
      description: 'ETH/USD',
      price: '1,000',
    },
  ];

  const price = '1,000';
  const interestRate = 0.011;

  return { isLoading, tokenName, marketDescription, tokens, markets, price, interestRate };
}
