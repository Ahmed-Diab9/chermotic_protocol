import { useCallback } from 'react';
import { Market } from '~/typings/market';
import useBookmarkOracles from '../commons/useBookmarkOracles';
import useOracleListener from '../commons/useOracleListener';

const useBookmarksUpdate = () => {
  const { markets, mutateMarketOracles } = useBookmarkOracles();
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
};

export default useBookmarksUpdate;
