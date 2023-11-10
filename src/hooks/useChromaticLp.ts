import { Client as LpClient } from '@chromatic-protocol/liquidity-provider-sdk';
import { ChromaticRegistry } from '@chromatic-protocol/liquidity-provider-sdk/dist/esm/entities/ChromaticRegistry';
import { isNil, isNotNil } from 'ramda';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { Address, useAccount } from 'wagmi';
import { LP_TAG_ORDER } from '~/configs/lp';
import { loadedAction } from '~/store/reducer/loaded';
import { useAppDispatch, useAppSelector } from '~/store';
import { lpAction } from '~/store/reducer/lp';
import { ChromaticLp } from '~/typings/lp';
import { MarketLike } from '~/typings/market';
import { checkAllProps } from '~/utils';
import { trimMarket, trimMarkets } from '~/utils/market';
import { divPreserved } from '~/utils/number';
import { PromiseOnlySuccess } from '~/utils/promise';
import CLP from '../assets/tokens/CLP.svg';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import useLocalStorage from './useLocalStorage';
import { useEntireMarkets, useMarket } from './useMarket';
import { useSettlementToken } from './useSettlementToken';

type FetchChromaticLpArgs = {
  lpClient: LpClient;
  registry: ChromaticRegistry;
  walletAddress?: Address;
  market: MarketLike;
};

const fetchChromaticLp = async (args: FetchChromaticLpArgs) => {
  const { lpClient, registry, walletAddress, market } = args;
  const lp = lpClient.lp();
  const lpAddresses = await registry?.lpListByMarket(market.address);
  const lpResponses = lpAddresses
    .map((lpAddress) => {
      const lpTag = lp.getLpTag(lpAddress);
      const lpName = lp.getLpName(lpAddress);
      let balance = undefined as Promise<bigint> | undefined;
      if (isNotNil(walletAddress)) {
        balance = lp.balanceOf(lpAddress, walletAddress);
      }

      const lpToken = lp.contracts().lpToken(lpAddress);
      const clpName = lpToken.read.name();
      const clpSymbol = lpToken.read.symbol();
      const clpDecimals = lpToken.read.decimals();
      const totalSupply = lp.totalSupply(lpAddress);
      const valueInfo = lp.valueInfo(lpAddress);
      const utilization = lp.utilization(lpAddress);
      const minimalLiquidity = lp.estimateMinAddLiquidityAmount(lpAddress);

      const bins = lp.clbTokenBalances(lpAddress);
      const binIds = lp.clbTokenIds(lpAddress);

      return [
        lpTag,
        lpName,
        balance,
        clpName,
        clpSymbol,
        clpDecimals,
        totalSupply,
        valueInfo,
        utilization,
        minimalLiquidity,
        bins,
        binIds,
      ] as const;
    })
    .flat(1);
  const responseTuple = await Promise.allSettled(lpResponses);
  const lpInfoArray = [] as ChromaticLp[];
  for (let index = 0; index < responseTuple.length; index++) {
    const item = responseTuple[index];
    if (item.status === 'rejected') {
      continue;
    }
    const tupleIndex = index % 12;
    const lpIndex = Math.floor(index / 12);
    switch (tupleIndex) {
      case 0: {
        lpInfoArray[lpIndex] = {
          image: CLP,
          market,
          address: lpAddresses[lpIndex],
        } as ChromaticLp;
        lpInfoArray[lpIndex].tag = item.value as string;
        continue;
      }
      case 1: {
        lpInfoArray[lpIndex].name = item.value as string;
        continue;
      }
      case 2: {
        lpInfoArray[lpIndex].balance = item.value as bigint;
        continue;
      }
      case 3: {
        lpInfoArray[lpIndex].clpName = item.value as string;
        continue;
      }
      case 4: {
        lpInfoArray[lpIndex].clpSymbol = item.value as string;
        continue;
      }
      case 5: {
        lpInfoArray[lpIndex].clpDecimals = item.value as number;
        continue;
      }
      case 6: {
        lpInfoArray[lpIndex].totalSupply = item.value as bigint;
        continue;
      }
      case 7: {
        const { total, holding, pending, holdingClb, pendingClb } = item.value as {
          total: bigint;
          holding: bigint;
          pending: bigint;
          holdingClb: bigint;
          pendingClb: bigint;
        };
        lpInfoArray[lpIndex].totalValue = total;
        lpInfoArray[lpIndex].holdingValue = holding;
        lpInfoArray[lpIndex].holdingClbValue = holdingClb;
        lpInfoArray[lpIndex].pendingValue = pending;
        lpInfoArray[lpIndex].pendingClbValue = pendingClb;
        continue;
      }
      case 8: {
        lpInfoArray[lpIndex].utilization = item.value as number;
        continue;
      }
      case 9: {
        lpInfoArray[lpIndex].minimalLiquidity = item.value as bigint;
        continue;
      }
      case 10: {
        lpInfoArray[lpIndex].bins = item.value as bigint[];
        continue;
      }
      case 11: {
        lpInfoArray[lpIndex].binIds = item.value as bigint[];
        continue;
      }
    }
  }

  lpInfoArray.sort((previousLp, nextLp) => {
    const { tag: previousLpTag } = previousLp;
    const { tag: nextLpTag } = nextLp;
    return LP_TAG_ORDER[previousLpTag] - LP_TAG_ORDER[nextLpTag];
  });

  return lpInfoArray;
};

export const useEntireChromaticLp = () => {
  const { lpClient, isReady } = useChromaticClient();
  const { address: walletAddress } = useAccount();
  const { markets } = useEntireMarkets();
  const { tokens } = useSettlementToken();
  const fetchKey = {
    key: 'getEntireChromaticLp',
    walletAddress,
    markets: trimMarkets(markets),
    tokens,
  };

  const {
    data: lpList,
    isLoading,
    error,
  } = useSWR(
    isReady && checkAllProps(fetchKey) ? fetchKey : undefined,
    async ({ walletAddress, markets, tokens }) => {
      const registry = lpClient.registry();
      const chromaticLps = await PromiseOnlySuccess(
        markets.map((market) => {
          return fetchChromaticLp({ lpClient, registry, walletAddress, market });
        })
      );
      return chromaticLps.flat(1).map((lpValue) => {
        const { totalValue, totalSupply, clpDecimals, market } = lpValue;
        const settlementToken = tokens?.find((token) => token.address === market.tokenAddress);
        if (isNil(settlementToken)) {
          return {
            ...lpValue,
          };
        }
        if (totalSupply === 0n) {
          return { ...lpValue, settlementToken };
        }
        const lpPrice = divPreserved(totalValue, totalSupply, clpDecimals);
        return {
          ...lpValue,
          price: lpPrice,
          settlementToken,
        };
      });
    }
  );

  useError({ error });

  return { lpList };
};

export const useChromaticLp = () => {
  const { lpClient, isReady } = useChromaticClient();
  const { address: walletAddress } = useAccount();
  const { currentMarket } = useMarket();
  const { tokens } = useSettlementToken();
  const fetchKey = {
    key: 'getChromaticLp',
    market: trimMarket(currentMarket),
    tokens,
  };
  const { setState: setStoredLpAddress } = useLocalStorage<Address>('app:lp');
  const dispatch = useAppDispatch();
  const {
    data: lpList,
    error,
    isLoading: isLpLoading,
    mutate,
  } = useSWR(
    isReady && checkAllProps(fetchKey) ? { ...fetchKey, walletAddress } : undefined,
    async ({ walletAddress, market, tokens }) => {
      const registry = lpClient.registry();
      const lpArray = await fetchChromaticLp({ lpClient, registry, walletAddress, market });
      const detailedLps = lpArray.map((lpValue) => {
        const { totalValue, totalSupply, clpDecimals } = lpValue;
        const settlementToken = tokens?.find((token) => token.address === market.tokenAddress);
        if (isNil(settlementToken) || isNil(currentMarket)) {
          return {
            ...lpValue,
          };
        }
        if (totalSupply === 0n) {
          return { ...lpValue, settlementToken, market: currentMarket };
        }
        const lpPrice = divPreserved(totalValue, totalSupply, clpDecimals);
        return {
          ...lpValue,
          price: lpPrice,
          settlementToken,
          market: currentMarket,
        };
      });
      return detailedLps;
    },
    {
      keepPreviousData: false,
    }
  );

  useEffect(() => {
    if (isNotNil(lpList) && !isLpLoading) {
      dispatch(loadedAction.onDataLoaded('chromaticLp'));
    }
  }, [dispatch, lpList, isLpLoading]);

  const onLpSelect = (nextLp: ChromaticLp) => {
    if (!isReady) {
      return;
    }
    setStoredLpAddress(nextLp.address);
    dispatch(lpAction.onLpSelect(nextLp));
    toast('Liquidity provider is selected.');
  };

  const selectedLp = useAppSelector((state) => state.lp.selectedLp);

  const refreshChromaticLp = () => {
    mutate();
  };

  useError({ error });

  return { lpList, isLpLoading, onLpSelect, selectedLp, fetchChromaticLp, refreshChromaticLp };
};
