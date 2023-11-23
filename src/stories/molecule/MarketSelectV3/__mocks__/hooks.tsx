export function useMarketSelectV3() {
  const isLoading = false;
  const token = { name: 'cETH', address: '0x', image: '' };
  const market = { description: 'ETH / USD', address: '0x', image: '' };
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

  return {
    isLoading,
    token,
    market,
    tokens,
    markets,
    price,
    interestRate,
  };
}
