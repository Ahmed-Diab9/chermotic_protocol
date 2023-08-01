import { useMarket } from '~/hooks/useMarket';
import useOracleVersion from '~/hooks/useOracleVersion';
import { usePositions } from '~/hooks/usePositions';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { TradeBar as TradeBarPresenter } from '~/stories/template/TradeBar';

export const TradeBar = () => {
  const { currentToken } = useSettlementToken();
  const { markets, currentMarket } = useMarket();
  const { positions, isLoading } = usePositions();
  const { oracleVersions } = useOracleVersion();

  return (
    <TradeBarPresenter
      token={currentToken}
      markets={markets}
      market={currentMarket}
      positions={positions}
      oracleVersions={oracleVersions}
      isLoading={isLoading}
    />
  );
};
