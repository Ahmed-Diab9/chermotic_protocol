import { useFeeRate } from '~/hooks/useFeeRate';
import { useMarket } from '~/hooks/useMarket';
import { usePreviousOracle } from '~/hooks/usePreviousVersion';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { MarketSelect as MarketSelectPresenter } from '~/stories/molecule/MarketSelect';

export const MarketSelect = () => {
  const { tokens, currentToken, isTokenLoading, onTokenSelect } = useSettlementToken();
  const { markets, currentMarket, isMarketLoading, onMarketSelect } = useMarket();
  const { feeRate } = useFeeRate();
  const { previousOracle } = usePreviousOracle({ market: currentMarket });

  return (
    <MarketSelectPresenter
      tokens={tokens}
      markets={markets}
      selectedToken={currentToken}
      selectedMarket={currentMarket}
      previousMarketOracle={previousOracle}
      feeRate={feeRate}
      isLoading={isTokenLoading || isMarketLoading}
      onTokenClick={onTokenSelect}
      onMarketClick={onMarketSelect}
    />
  );
};
