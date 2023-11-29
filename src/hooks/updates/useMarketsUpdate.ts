import { useCallback } from 'react';
import { Market } from '~/typings/market';
import useMarketOracle from '../commons/useMarketOracle';
import useMarketOracles from '../commons/useMarketOracles';
import useMarkets from '../commons/useMarkets';
import useOracleListener from '../commons/useOracleListener';

const useMarketsUpdate = () => {
  const { markets, currentMarket } = useMarkets();
  const { mutateMarketOracles } = useMarketOracles({ markets });
  const { refreshMarketOracle } = useMarketOracle({ market: currentMarket });
  const onUpdate = useCallback(
    (market: Market) => {
      mutateMarketOracles(market.address);
    },
    [mutateMarketOracles]
  );

  useOracleListener({
    markets,
    onUpdate,
  });

  useOracleListener({
    market: currentMarket,
    onUpdate: useCallback(() => {
      refreshMarketOracle();
    }, [refreshMarketOracle]),
  });
};

export default useMarketsUpdate;
