import { ClaimableLiquidityResult } from '@chromatic-protocol/sdk-viem';
import { isNil } from 'ramda';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { Address } from 'wagmi';
import { FEE_RATE_DECIMAL } from '~/configs/decimals';
import { AppError } from '~/typings/error';
import { errorLog } from '~/utils/log';
import { checkAllProps } from '../utils';
import { mulPreserved, numberBuffer, percentage } from '../utils/number';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { useLiquidityPool } from './useLiquidityPool';
import { useMarket } from './useMarket';
import useOracleVersion from './useOracleVersion';

export type LpReceiptAction = 'add' | 'remove';
export interface LpReceipt {
  id: bigint;
  version: bigint;
  amount: bigint;
  recipient: Address;
  feeRate: number;
  status: 'standby' | 'in progress' | 'completed'; // "standby";
  name: string;
  burningAmount: bigint;
  action: LpReceiptAction;
}

const receiptDetail = (
  action: 0 | 1 | number,
  receiptOracleVersion: bigint,
  currentOracleVersion: bigint,
  bin: ClaimableLiquidityResult
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
      if (bin.burningCLBTokenAmountRequested === bin.burningCLBTokenAmount) {
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
  const { currentMarket } = useMarket();
  const { liquidityPool } = useLiquidityPool();
  const { currentMarketOracleVersion } = useOracleVersion();

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
    currentOracleVersion: currentMarketOracleVersion?.version,
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
    async ({ marketAddress, address, currentOracleVersion, liquidityPool }) => {
      const lensApi = client.lens();
      const receipts = await lensApi.contracts().lens.read.lpReceipts([marketAddress, address]);
      if (!receipts) {
        return [];
      }
      const ownedBinsParam = receipts.map((receipt) => ({
        tradingFeeRate: receipt.tradingFeeRate,
        oracleVersion: receipt.oracleVersion,
      }));
      const ownedBins = await lensApi.claimableLiquidities(marketAddress, ownedBinsParam);
      return receipts
        .map((receipt) => {
          const ownedBin = ownedBins.find((bin) => bin.tradingFeeRate === receipt.tradingFeeRate);
          const bin = liquidityPool?.bins.find((bin) => bin.baseFeeRate === receipt.tradingFeeRate);

          if (!ownedBin || !bin) {
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
          let status: LpReceipt['status'] = 'standby';
          status = receiptDetail(action, receiptOracleVersion, currentOracleVersion, ownedBin);

          return {
            id,
            action: action === 0 ? 'add' : 'remove',
            amount:
              action === 0 ? amount : mulPreserved(amount, bin.clbTokenValue, bin.clbTokenDecimals),
            feeRate: tradingFeeRate,
            status,
            version: receiptOracleVersion,
            recipient,
            name: binName(tradingFeeRate, currentMarket?.description),
            burningAmount: action === 0 ? 0n : ownedBin.burningTokenAmount,
          } satisfies LpReceipt;
        })
        .filter((receipt): receipt is NonNullable<LpReceipt> => !!receipt);
    }
  );

  const onClaimCLBTokens = useCallback(
    async (receiptId: bigint, action?: LpReceipt['action']) => {
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
        toast((error as any).message);
      }
    },
    [walletAddress, currentMarket]
  );

  const onClaimCLBTokensBatch = useCallback(async () => {
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
        addCompleted.length > 0
          ? routerApi?.claimLiquidites(currentMarket.address, addCompleted)
          : undefined,
        removeCompleted.length > 0
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
      // await fetchLiquidityPools();
      toast('All receipts are claimed.');
    } catch (error) {
      toast((error as any).message);
    }
  }, [walletAddress, currentMarket, receipts]);

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
