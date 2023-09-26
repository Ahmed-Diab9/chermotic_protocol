import { isNil } from 'ramda';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { Address, useAccount } from 'wagmi';
import { useAppDispatch } from '~/store';
import { lpAction } from '~/store/reducer/lp';
import { ChromaticLp } from '~/typings/lp';
import { checkAllProps } from '~/utils';
import { divPreserved, mulPreserved } from '~/utils/number';
import { PromiseOnlySuccess } from '~/utils/promise';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import useLocalStorage from './useLocalStorage';
import { useMarket } from './useMarket';
import usePriceFeed from './usePriceFeed';
import { useSettlementToken } from './useSettlementToken';

export const useChromaticLp = () => {
  const { lpClient, isReady } = useChromaticClient();
  const { address } = useAccount();
  const { currentMarket } = useMarket();
  const { tokens } = useSettlementToken();
  const { priceFeed } = usePriceFeed();
  const fetchKey = {
    key: 'getChromaticLp',
    address,
    market: currentMarket,
    priceFeed,
  };
  const { setState: setStoredLpAddress } = useLocalStorage<Address>('app:lp');
  const dispatch = useAppDispatch();
  const {
    data: lpList,
    error,
    isLoading: isLpLoading,
  } = useSWR(
    isReady && checkAllProps(fetchKey) ? fetchKey : undefined,
    async ({ address, market, priceFeed }) => {
      const registry = lpClient?.registry();
      const lpAddresses = await registry?.lpListByMarket(market.address);
      const lpInfoArray = lpAddresses.map(async (lpAddress) => {
        const lp = lpClient.lp();
        const lpName = lp.getLpName(lpAddress);
        const balance = lp.balanceOf(lpAddress, address);
        const decimals = (await lp.lpTokenMeta(lpAddress)).decimals;
        const totalSupply = lp.totalSupply(lpAddress);
        const valueInfo = lp.valueInfo(lpAddress);
        const utilization = lp.utilization(lpAddress);

        const requests = [
          lpAddress,
          lpName,
          balance,
          decimals,
          totalSupply,
          valueInfo,
          utilization,
        ] as const;
        const response = await Promise.allSettled(requests);
        return response.reduce((provider, responseItem, itemIndex) => {
          if (responseItem.status === 'rejected') {
            return provider;
          }
          const { value } = responseItem;
          switch (itemIndex) {
            case 0: {
              provider.address = value as Awaited<typeof lpAddress>;
              break;
            }
            case 1: {
              provider.name = value as Awaited<typeof lpName>;
              break;
            }
            case 2: {
              provider.balance = value as Awaited<typeof balance>;
              break;
            }
            case 3: {
              provider.decimals = value as Awaited<typeof decimals>;
              break;
            }
            case 4: {
              provider.totalSupply = value as Awaited<typeof totalSupply>;
              break;
            }
            case 5: {
              const { total, holding, holdingClb, pending, pendingClb } = value as Awaited<
                typeof valueInfo
              >;
              provider = {
                ...provider,
                totalValue: total,
                holdingValue: holding,
                holdingClbValue: holdingClb,
                pendingValue: pending,
                pendingClbValue: pendingClb,
              };
              break;
            }
            case 6: {
              provider = {
                ...provider,
                utilization: value as number,
              };
              break;
            }
            default: {
              break;
            }
          }
          return provider;
        }, {} as ChromaticLp);
      });
      const awaitedLpArray = await PromiseOnlySuccess(lpInfoArray);
      return awaitedLpArray.map((lpValue) => {
        const { totalValue, totalSupply, decimals } = lpValue;
        const settlementToken = tokens?.find((token) => token.address === market.tokenAddress);
        if (isNil(settlementToken) || isNil(currentMarket)) {
          return {
            ...lpValue,
          };
        }
        if (totalSupply === 0n) {
          return { ...lpValue, settlementToken, market: currentMarket };
        }
        const tokenFeed = priceFeed?.[market.tokenAddress];
        const lpPrice = mulPreserved(
          divPreserved(totalValue, totalSupply, decimals),
          tokenFeed.value,
          tokenFeed.decimals
        );
        return {
          ...lpValue,
          price: lpPrice,
          settlementToken,
          market: currentMarket,
        };
      });
    }
  );

  const onLpSelect = (nextLp: ChromaticLp) => {
    if (!isReady) {
      return;
    }
    setStoredLpAddress(nextLp.address);
    dispatch(lpAction.onLpSelect(nextLp));
    toast('Liquidity provider is selected.');
  };

  useError({ error });
  useEffect(() => {
    console.log(lpList, 'lp list');
  }, [lpList]);

  return { lpList, isLpLoading, onLpSelect };
};
