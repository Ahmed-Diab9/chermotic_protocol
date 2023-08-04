import { useMemo } from 'react';
import { useMarket } from '~/hooks/useMarket';
import useOracleVersion from '~/hooks/useOracleVersion';
import usePoolReceipt from '~/hooks/usePoolReceipt';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { PoolProgress as PoolProgressPresenter } from '~/stories/molecule/PoolProgress';

export const PoolProgress = () => {
  const { currentToken } = useSettlementToken();
  const { currentMarket } = useMarket();
  const { receipts, isReceiptsLoading, onClaimCLBTokens, onClaimCLBTokensBatch } = usePoolReceipt();
  const { oracleVersions } = useOracleVersion();
  const oracleVersion = useMemo(
    () => (oracleVersions && currentMarket ? oracleVersions![currentMarket.address] : undefined),
    [oracleVersions, currentMarket]
  );

  return (
    <PoolProgressPresenter
      token={currentToken}
      market={currentMarket}
      receipts={receipts}
      isLoading={isReceiptsLoading}
      oracleVersion={oracleVersion}
      onReceiptClaim={onClaimCLBTokens}
      onReceiptClaimBatch={onClaimCLBTokensBatch}
    />
  );
};
