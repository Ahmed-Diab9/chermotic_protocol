import { useFeeRate } from '~/hooks/useFeeRate';
import { useMarket } from '~/hooks/useMarket';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { MarketSelect as MarketSelectPresenter } from '~/stories/molecule/MarketSelect';

export const MarketSelect = () => {
  const { tokens, currentToken, isTokenLoading, onTokenSelect } = useSettlementToken();
  const { markets, currentMarket, isMarketLoading, onMarketSelect } = useMarket();
  const { feeRate } = useFeeRate();

  return (
    <MarketSelectPresenter
      tokens={tokens}
      markets={markets}
      selectedToken={currentToken}
      selectedMarket={currentMarket}
      feeRate={feeRate}
      isLoading={isTokenLoading || isMarketLoading}
      onTokenClick={onTokenSelect}
      onMarketClick={onMarketSelect}
    />
  );
};
