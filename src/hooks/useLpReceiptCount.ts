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
    data: counts,
    error,
    isLoading: isCountLoading,
    mutate,
  } = useSWR(
    checkAllProps(fetchKey) ? fetchKey : null,
    async ({ lpAddress, walletAddress }) => {
      let minting = 0;
      let burning = 0;
      let mintingSettled = 0;
      let burningSettled = 0;
      let inProgress = 0;

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

      minting += addLiquidities.length;
      burning += removeLiquidities.length;
      mintingSettled += addLiquiditySettleds.length;
      burningSettled += removeLiquiditySettleds.length;
      inProgress = minting + burning - (mintingSettled + burningSettled);
      return {
        minting,
        burning,
        mintingSettled,
        burningSettled,
        inProgress,
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
    counts,
    isCountLoading,
    onRefreshLpReceiptCount,
  };
};
