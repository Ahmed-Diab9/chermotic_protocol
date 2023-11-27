export function useMarketSelect() {
  const isLoading = false;

  const tokenName = 'CHRM';
  const marketDescription = 'ETH/USD';

  const tokens = [{ key: 0, isSelectedToken: true, name: 'CHRM', address: '0x1' }];

  const markets = [
    {
      key: 0,
      isSelectedMarket: true,
      address: '0x2',
      description: 'ETH/USD',
      price: '1,000',
    },
  ];

  const price = '1,000';
  const interestRate = 0.011;

  return { isLoading, tokenName, marketDescription, tokens, markets, price, interestRate };
}
