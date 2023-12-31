import { ClaimableLiquidityResult, PendingLiquidityResult } from '@chromatic-protocol/sdk-viem';
import { indexBy, isNil } from 'ramda';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { Address } from 'wagmi';
import { FEE_RATE_DECIMAL } from '~/configs/decimals';
import { AppError } from '~/typings/error';
import { errorLog } from '~/utils/log';
import { checkAllProps } from '../utils';
import {
  divPreserved,
  formatDecimals,
  mulPreserved,
  numberBuffer,
  percentage,
} from '../utils/number';
import useMarkets from './commons/useMarkets';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { useLiquidityPool } from './useLiquidityPool';

export type PoolReceiptAction = 'add' | 'remove';
export interface PoolReceipt {
  id: bigint;
  version: bigint;
  amount: bigint;
  recipient: Address;
  feeRate: number;
  status: 'standby' | 'in progress' | 'completed'; // "standby";
  name: string;
  image: string;
  burningAmount: bigint;
  action: PoolReceiptAction;
  progressPercent: number;
  totalCLBAmount: bigint;
  remainedCLBAmount: bigint;
}

const receiptDetail = (
  action: 0 | 1 | number,
  receiptOracleVersion: bigint,
  currentOracleVersion: bigint,
  bin: ClaimableLiquidityResult,
  pendingLiquidity: PendingLiquidityResult
) => {
  switch (action) {
    case 0:
      if (receiptOracleVersion < currentOracleVersion) {
        return 'completed';
      } else {
        return 'standby';
      }
    case 1:
      if (receiptOracleVersion >= currentOracleVersion) {
        return 'standby';
      }
      if (
        bin.burningCLBTokenAmountRequested === bin.burningCLBTokenAmount &&
        pendingLiquidity.oracleVersion !== receiptOracleVersion
      ) {
        return 'completed';
      } else {
        return 'in progress';
      }
    default:
      return 'standby';
  }
};

const usePoolReceipt = () => {
  const { client, walletAddress } = useChromaticClient();
  const { currentMarket } = useMarkets();
  const { liquidityPool } = useLiquidityPool();

  const binName = useCallback((feeRate: number, description?: string) => {
    const prefix = feeRate > 0 ? '+' : '';
    return `${description || ''} ${prefix}${(
      (feeRate * percentage()) /
      numberBuffer(FEE_RATE_DECIMAL)
    ).toFixed(2)}%`;
  }, []);

  const fetchKey = {
    name: 'getPoolReceipt',
    type: 'EOA',
    address: walletAddress,
    marketAddress: currentMarket?.address,
    liquidityPool: liquidityPool,
  };
  const {
    data: receipts,
    error,
    mutate: fetchReceipts,
    isLoading: isReceiptsLoading,
  } = useSWR(
    checkAllProps(fetchKey) ? fetchKey : null,
    async ({ marketAddress, address, liquidityPool }) => {
      const lensApi = client.lens();
      const marketApi = client.market();
      const receipts = await lensApi.contracts().lens.read.lpReceipts([marketAddress, address]);
      const marketOracle = await marketApi.getCurrentPrice(marketAddress);
      if (!receipts) {
        return [];
      }
      const pendingRemoveLiquidities = await lensApi.pendingLiquidityBatch(
        marketAddress,
        receipts.map((receipt) => receipt.tradingFeeRate)
      );

      const pendingRemoveLiquidityMap = indexBy(
        (pendingLiquidity) => pendingLiquidity.tradingFeeRate,
        pendingRemoveLiquidities
      );
      const ownedBinsParam = receipts.map((receipt) => ({
        tradingFeeRate: receipt.tradingFeeRate,
        oracleVersion: receipt.oracleVersion,
      }));
      const claimableLiquidities = await lensApi.claimableLiquidities(
        marketAddress,
        ownedBinsParam
      );
      return receipts
        .map((receipt) => {
          const claimableLiquidityForReceipt =
            claimableLiquidities[receipt.tradingFeeRate][receipt.oracleVersion.toString()];

          const bin = liquidityPool?.bins.find((bin) => bin.baseFeeRate === receipt.tradingFeeRate);

          if (!claimableLiquidityForReceipt || !bin) {
            return null;
          }
          const {
            id,
            oracleVersion: receiptOracleVersion,
            action,
            amount,
            recipient,
            tradingFeeRate,
          } = receipt;

          const myBurnedCLBAmount =
            claimableLiquidityForReceipt.burningCLBTokenAmountRequested === 0n
              ? 0n
              : (receipt.amount * claimableLiquidityForReceipt.burningCLBTokenAmount) /
                claimableLiquidityForReceipt.burningCLBTokenAmountRequested;

          const burnedSettlementAmount =
            claimableLiquidityForReceipt.burningCLBTokenAmountRequested === 0n
              ? 0n
              : (claimableLiquidityForReceipt.burningTokenAmount * receipt.amount) /
                claimableLiquidityForReceipt.burningCLBTokenAmountRequested;
          const remainedCLBAmount = amount - myBurnedCLBAmount;
          const settlementTotalAmount =
            burnedSettlementAmount +
            mulPreserved(remainedCLBAmount, bin.clbTokenValue, bin.clbTokenDecimals);

          let status: PoolReceipt['status'] = 'standby';
          status = receiptDetail(
            action,
            receiptOracleVersion,
            marketOracle.version,
            claimableLiquidityForReceipt,
            pendingRemoveLiquidityMap[tradingFeeRate]
          );

          const result = {
            id,
            action: action === 0 ? 'add' : 'remove',
            amount: action === 0 ? amount : settlementTotalAmount,
            feeRate: tradingFeeRate,
            status,
            version: receiptOracleVersion,
            recipient,
            name: binName(tradingFeeRate, currentMarket?.description),
            image: bin.clbTokenImage,
            burningAmount: action === 0 ? 0n : burnedSettlementAmount,
            progressPercent: Number(
              formatDecimals(
                divPreserved(
                  claimableLiquidityForReceipt.burningCLBTokenAmount,
                  claimableLiquidityForReceipt.burningCLBTokenAmountRequested,
                  bin.clbTokenDecimals
                ),
                bin.clbTokenDecimals - 2
              )
            ),
            totalCLBAmount: amount,
            remainedCLBAmount: remainedCLBAmount,
          } satisfies PoolReceipt;
          return result;
        })
        .filter((receipt): receipt is NonNullable<PoolReceipt> => !!receipt);
    }
  );

  const onClaimCLBTokens = useCallback(
    async (receiptId: bigint, action?: PoolReceipt['action']) => {
      const routerApi = client.router();
      if (isNil(currentMarket)) {
        errorLog('no selected markets');
        toast('Market is not selected.');
        return AppError.reject('no selected markets', 'onPoolReceipt');
      }
      if (isNil(walletAddress)) {
        errorLog('wallet not connected');
        toast('Wallet is not connected.');
        return;
      }
      try {
        if (action === 'add') {
          await routerApi.claimLiquidity(currentMarket.address, receiptId);
        } else if (action === 'remove') {
          await routerApi.withdrawLiquidity(currentMarket.address, receiptId);
        }

        await fetchReceipts();
        if (action === 'add') {
          toast('Your clb tokens are claimed.');
        } else {
          toast('You removed the selected liquidity.');
        }
      } catch (error) {
        toast.error('Transaction rejected.');
      }
    },
    [walletAddress, currentMarket]
  );

  const onClaimCLBTokensBatch = useCallback(
    async (action?: 'add' | 'remove') => {
      if (isNil(currentMarket)) {
        errorLog('no selected markets');
        toast('Market is not selected.');
        return AppError.reject('no selected markets', 'onPoolReceipt');
      }
      if (isNil(receipts)) {
        errorLog('no receipts');
        toast('There are no receipts.');
        return AppError.reject('no receipts', 'onPoolReceipt');
      }
      if (isNil(walletAddress)) {
        errorLog('wallet not connected');
        toast('Wallet is not connected.');
        return;
      }
      const addCompleted = receipts
        .filter((receipt) => receipt.action === 'add' && receipt.status === 'completed')
        .map((receipt) => receipt.id);
      const removeCompleted = receipts
        .filter((receipt) => receipt.action === 'remove')
        .map((receipt) => receipt.id);
      if (addCompleted.length <= 0 && removeCompleted.length <= 0) {
        errorLog('No receipts');
        toast('There are no receipts.');
        AppError.reject('No completed receupts', 'onPoolReceipt');
        return;
      }
      try {
        const routerApi = client.router();
        const response = await Promise.allSettled([
          action !== 'remove' && addCompleted.length > 0
            ? routerApi?.claimLiquidites(currentMarket.address, addCompleted)
            : undefined,
          action !== 'add' && removeCompleted.length > 0
            ? routerApi?.withdrawLiquidities(currentMarket.address, removeCompleted)
            : undefined,
        ]);
        const errors = response.filter(
          (result): result is PromiseRejectedResult => result.status === 'rejected'
        );
        if (errors.length > 0) {
          errors.forEach((error) => {
            toast(error.reason);
          });
          return;
        }
        await fetchReceipts();
        toast('All receipts are claimed.');
      } catch (error) {
        toast.error('Transaction rejected.');
      }
    },
    [walletAddress, currentMarket, receipts]
  );

  useError({ error });

  return {
    receipts,
    isReceiptsLoading,
    fetchReceipts,
    onClaimCLBTokens,
    onClaimCLBTokensBatch,
  };
};

export default usePoolReceipt;
