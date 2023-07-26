import { ClaimableLiquidityResult } from '@chromatic-protocol/sdk-viem';
import { useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { useAccount } from 'wagmi';
import { FEE_RATE_DECIMAL } from '~/configs/decimals';
import { AppError } from '~/typings/error';
import { errorLog } from '~/utils/log';
import { isValid } from '~/utils/valid';
import { useAppSelector } from '../store';
import { checkAllProps } from '../utils';
import { mulPreserved, numberBuffer, percentage } from '../utils/number';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { useLiquidityPool } from './useLiquidityPool';
import useOracleVersion from './useOracleVersion';

export type LpReceiptAction = 'add' | 'remove';
export interface LpReceipt {
  id: bigint;
  version: bigint;
  amount: bigint;
  recipient: `0x${string}`;
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
  const market = useAppSelector((state) => state.market.selectedMarket);
  const { client } = useChromaticClient();
  const router = useMemo(() => client?.router(), [client]);
  const lensApi = useMemo(() => client?.lens(), [client]);
  const { oracleVersions } = useOracleVersion();
  const { address } = useAccount();
  const currentOracleVersion = market && oracleVersions?.[market.address]?.version;
  const marketAddress = market?.address;
  const { liquidityPool } = useLiquidityPool(marketAddress);

  const binName = useCallback((feeRate: number, description?: string) => {
    const prefix = feeRate > 0 ? '+' : '';
    return `${description || ''} ${prefix}${(
      (feeRate * percentage()) /
      numberBuffer(FEE_RATE_DECIMAL)
    ).toFixed(2)}%`;
  }, []);

  const fetchKey = {
    name: 'getPoolReceipt',
    lensApi,
    address,
    currentOracleVersion,
    marketAddress,
    liquidityPool,
  };
  const {
    data: receipts,
    error,
    mutate: fetchReceipts,
    isLoading: isReceiptsLoading,
  } = useSWR(
    checkAllProps(fetchKey) ? fetchKey : null,
    async ({ lensApi, marketAddress, address, currentOracleVersion, liquidityPool }) => {
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
            name: binName(tradingFeeRate, market?.description),
            burningAmount: action === 0 ? 0n : ownedBin.burningTokenAmount,
          } satisfies LpReceipt;
        })
        .filter((receipt): receipt is NonNullable<LpReceipt> => !!receipt);
    }
  );

  const onClaimCLBTokens = useCallback(
    async (receiptId: bigint, action?: LpReceipt['action']) => {
      if (!isValid(router)) {
        errorLog('no router contracts');
        toast('No routers error');
        return AppError.reject('no router contracts', 'onPoolReceipt');
      }
      if (!isValid(market)) {
        errorLog('no selected markets');
        toast('Market is not selected.');
        return AppError.reject('no selected markets', 'onPoolReceipt');
      }
      try {
        if (action === 'add') {
          await router.claimLiquidity(market.address, receiptId);
        } else if (action === 'remove') {
          await router.withdrawLiquidity(market.address, receiptId);
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
    [router, market]
  );

  const onClaimCLBTokensBatch = useCallback(async () => {
    if (!isValid(market)) {
      errorLog('no selected markets');
      toast('Market is not selected.');
      return AppError.reject('no selected markets', 'onPoolReceipt');
    }
    if (!isValid(receipts)) {
      errorLog('no receipts');
      toast('There are no receipts.');
      return AppError.reject('no receipts', 'onPoolReceipt');
    }
    if (!isValid(router)) {
      errorLog('no router contracts');
      toast('Create Chromatic account.');
      return AppError.reject('no router contracts', 'onPoolReceipt');
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
      const response = await Promise.allSettled([
        addCompleted.length > 0 ? router?.claimLiquidites(market.address, addCompleted) : undefined,
        removeCompleted.length > 0
          ? router?.withdrawLiquidities(market.address, removeCompleted)
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
  }, [market, receipts, router]);

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
