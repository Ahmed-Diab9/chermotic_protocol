import { BigNumberish } from 'ethers';
import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { useAccount } from 'wagmi';
import { FEE_RATE_DECIMAL } from '~/configs/decimals';
import { AppError } from '~/typings/error';
import { errorLog } from '~/utils/log';
import { isValid } from '~/utils/valid';
import { useAppSelector } from '../store';
import { numberBuffer, percentage } from '../utils/number';
import { useChromaticClient } from './useChromaticClient';
import useOracleVersion from './useOracleVersion';
import { ClaimableLiquidityResult } from '@chromatic-protocol/sdk-viem';
import { toast } from 'react-toastify';

export type LpReceiptAction = 'add' | 'remove';
export interface LpReceipt {
  id: bigint;
  version: bigint;
  amount: bigint;
  recipient: string;
  feeRate: number;
  status: 'standby' | 'in progress' | 'completed'; // "standby";
  name: string;
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
  const lensApi = useMemo(() => client?.lens(), [client]);
  const router = useMemo(() => client?.router(), [client]);
  const { oracleVersions } = useOracleVersion();
  const { address } = useAccount();
  const currentOracleVersion = market && oracleVersions?.[market.address]?.version;
  const marketAddress = market?.address;

  const binName = useCallback((feeRate: number, description?: string) => {
    const prefix = feeRate > 0 ? '+' : '';
    return `${description || ''} ${prefix}${(
      (feeRate * percentage()) /
      numberBuffer(FEE_RATE_DECIMAL)
    ).toFixed(2)}%`;
  }, []);

  const {
    data: receipts,
    error,
    mutate: fetchReceipts,
    isLoading: isReceiptsLoading,
  } = useSWR(['RECEIPT', address, marketAddress, currentOracleVersion], async () => {
    if (
      address === undefined ||
      marketAddress === undefined ||
      currentOracleVersion === undefined ||
      lensApi === undefined
    ) {
      return [];
    }

    const receipts = await lensApi.contracts().lens.read.lpReceipts([marketAddress, address]);
    if (!receipts) {
      return [];
    }
    const ownedBinsParam = receipts.map((receipt) => ({
      tradingFeeRate: receipt.tradingFeeRate,
      oracleVersion: receipt.oracleVersion,
    }));
    const ownedBins = await lensApi.claimableLiquidities(marketAddress, ownedBinsParam);

    return ownedBins
      .map((bin) => {
        const receipt = receipts.find((receipt) => bin.tradingFeeRate === receipt.tradingFeeRate);
        if (!receipt) return null;

        const {
          id,
          oracleVersion: receiptOracleVersion,
          action,
          amount,
          recipient,
          tradingFeeRate,
        } = receipt;
        let status: LpReceipt['status'] = 'standby';
        status = receiptDetail(action, receiptOracleVersion, currentOracleVersion, bin);
        return {
          id,
          action: action === 0 ? 'add' : 'remove',
          amount,
          feeRate: tradingFeeRate,
          status,
          version: receiptOracleVersion,
          recipient,
          name: binName(tradingFeeRate, market?.description),
        } satisfies LpReceipt;
      })
      .filter((bin): bin is NonNullable<typeof bin> => !!bin);
  });

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
        toast((error as any).reason);
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
      response.filter(({ status }) => status === 'rejected').map(console.error);
      await fetchReceipts();
      // await fetchLiquidityPools();
      toast('All receipts are claimed.');
    } catch (error) {
      toast((error as any).reason);
    }
  }, [market, receipts, router]);

  if (error) {
    errorLog(error);
  }

  return {
    receipts,
    isReceiptsLoading,
    fetchReceipts,
    onClaimCLBTokens,
    onClaimCLBTokensBatch,
  };
};

export default usePoolReceipt;
