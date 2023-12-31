export function useMarketSelectV3Body() {
  const isLoading = false;
  const tokens = [{ key: '0x1', isSelectedToken: true, name: 'cETH', image: '', address: '0x1' }];
  const markets = [
    {
      key: '0x2',
      address: '0x2',
      isSelectedMarket: false,
      token: tokens[0],
      market: {
        image: '',
        address: '0x3',
        description: 'ETH / USD',
        tokenAddress: '0x1',
      },
    },
  ];
  const priceClassMap = {};
  const poolMap = {};
  const onBookmarkClick = () => {};

  return {
    isLoading,
    tokens,
    markets,
    priceClassMap,
    poolMap,
    onBookmarkClick,
  };
}
