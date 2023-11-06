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
      inProgresses +=
        addLiquidities.length +
        removeLiquidities.length -
        (addLiquiditySettleds.length + removeLiquiditySettleds.length);
      return {
        mintings,
        burnings,
        inProgresses,
      };
    },
    {
      refreshInterval: 0,
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
