import { useCallback } from 'react';
import { Market } from '~/typings/market';
import useFilteredMarkets from '../commons/useFilteredMarkets';
import useMarketOracle from '../commons/useMarketOracle';
import useOracleListener from '../commons/useOracleListener';
import { usePositions } from '../usePositions';

const usePositionsUpdate = () => {
  const { markets, currentMarket } = useFilteredMarkets();
  const { fetchCurrentPositions } = usePositions();
  const { refreshMarketOracle } = useMarketOracle({ market: currentMarket });
  const onUpdate = useCallback(
    (market: Market) => {
      if (market.address === currentMarket?.address) {
        refreshMarketOracle();
      }
      fetchCurrentPositions(market.address);
    },
    [currentMarket?.address, refreshMarketOracle, fetchCurrentPositions]
  );

  useOracleListener({
    markets,
    onUpdate,
  });
};

export default usePositionsUpdate;
