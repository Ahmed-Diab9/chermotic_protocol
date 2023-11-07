import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { useAccount } from 'wagmi';
import { checkAllProps } from '~/utils';
import { useError } from './useError';

import { lpGraphSdk } from '~/lib/graphql';
import { useAppSelector } from '~/store';

export const useLpReceiptCount = () => {
  const { address: walletAddress } = useAccount();
  const selectedLp = useAppSelector((state) => state.lp.selectedLp);
  const lpAddress = useMemo(() => {
    return selectedLp?.address;
  }, [selectedLp]);

  const fetchKey = {
    key: 'getLpReceiptCount',
    lpAddress,
    walletAddress,
  };
  const {
    data: count,
    error,
    isLoading: isCountLoading,
    mutate,
  } = useSWR(
    checkAllProps(fetchKey) ? fetchKey : null,
    async ({ lpAddress, walletAddress }) => {
      let mintings = 0;
      let burnings = 0;
      let mintingSettleds = 0;
      let burningSettleds = 0;
      let inProgresses = 0;

      const { addLiquidities } = await lpGraphSdk.AddLiquidityCount({ walletAddress, lpAddress });
      const { addLiquiditySettleds } = await lpGraphSdk.AddLiquiditySettledCount({
        lpAddress,
        walletAddress,
      });
      const { removeLiquidities } = await lpGraphSdk.RemoveLiquidityCount({
        walletAddress,
        lpAddress,
      });
      const { removeLiquiditySettleds } = await lpGraphSdk.RemoveLiquiditySettledCount({
        lpAddress,
        walletAddress,
      });

      mintings += addLiquidities.length;
      burnings += removeLiquidities.length;
      mintingSettleds += addLiquiditySettleds.length;
      burningSettleds += removeLiquiditySettleds.length;
      inProgresses = mintings + burnings - (mintingSettleds + burningSettleds);
      return {
        mintings,
        burnings,
        mintingSettleds,
        burningSettleds,
        inProgresses,
      };
    },
    {
      // TODO: Find proper interval seconds
      refreshInterval: 1000 * 24,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      revalidateOnFocus: false,
      revalidateFirstPage: true,
      shouldRetryOnError: false,
    }
  );

  useError({ error });

  const onRefreshLpReceiptCount = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    count,
    isCountLoading,
    onRefreshLpReceiptCount,
  };
};
