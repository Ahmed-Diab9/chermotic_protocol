import { useMarket } from '~/hooks/useMarket';
import usePoolReceipt from '~/hooks/usePoolReceipt';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { PoolProgress as PoolProgressPresenter } from '~/stories/molecule/PoolProgress';

export const PoolProgress = () => {
  const { currentToken } = useSettlementToken();
  const { currentMarket } = useMarket();
  const { receipts, isReceiptsLoading, onClaimCLBTokens, onClaimCLBTokensBatch } = usePoolReceipt();

  return (
    <PoolProgressPresenter
      token={currentToken}
      market={currentMarket}
      receipts={receipts}
      isLoading={isReceiptsLoading}
      oracleVersion={currentMarket?.oracleValue}
      onReceiptClaim={onClaimCLBTokens}
      onReceiptClaimBatch={onClaimCLBTokensBatch}
    />
  );
};
