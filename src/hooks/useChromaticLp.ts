import { Client as LpClient } from '@chromatic-protocol/liquidity-provider-sdk';
import { ChromaticRegistry } from '@chromatic-protocol/liquidity-provider-sdk/dist/esm/entities/ChromaticRegistry';
import { isNil, isNotNil } from 'ramda';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { Address, useAccount } from 'wagmi';
import { useAppDispatch } from '~/store';
import { lpAction } from '~/store/reducer/lp';
import { ChromaticLp } from '~/typings/lp';
import { Market } from '~/typings/market';
import { checkAllProps } from '~/utils';
import { divPreserved } from '~/utils/number';
import { PromiseOnlySuccess } from '~/utils/promise';
import CLP from '../assets/tokens/CLP.png';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import useLocalStorage from './useLocalStorage';
import { useEntireMarkets, useMarket } from './useMarket';
import { useSettlementToken } from './useSettlementToken';

type FetchChromaticLpArgs = {
  lpClient: LpClient;
  registry: ChromaticRegistry;
  walletAddress?: Address;
  market: Market;
};

const fetchChromaticLp = async (args: FetchChromaticLpArgs) => {
  const { lpClient, registry, walletAddress, market } = args;
  const lpAddresses = await registry?.lpListByMarket(market.address);
  const lpInfoArray = lpAddresses.map(async (lpAddress) => {
    const lp = lpClient.lp();
    const lpTag = lp.getLpTag(lpAddress);
    const lpName = lp.getLpName(lpAddress);
    let balance = undefined as Promise<bigint> | undefined;
    if (isNotNil(walletAddress)) {
      balance = lp.balanceOf(lpAddress, walletAddress);
    }
    const metadata = await lp.lpTokenMeta(lpAddress);
    const { decimals, symbol: clpName } = metadata;
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
      lpTag,
    ] as const;
    const response = await Promise.allSettled(requests);
    return response.reduce(
      (provider, responseItem, itemIndex) => {
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
            provider.balance = value as bigint;
            break;
          }
          case 3: {
            provider.decimals = decimals;
            provider.clpName = clpName;
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
          case 7: {
            provider = {
              ...provider,
              tag: value as Awaited<typeof lpTag>,
            };
            break;
          }
          default: {
            break;
          }
        }
        return provider;
      },
      {
        image: CLP,
        market,
      } as ChromaticLp
    );
  });

  return PromiseOnlySuccess(lpInfoArray) ?? [];
};

export const useEntireChromaticLp = () => {
  const { lpClient, isReady } = useChromaticClient();
  const { address: walletAddress } = useAccount();
  const { markets } = useEntireMarkets();
  const { tokens } = useSettlementToken();
  const fetchKey = {
    key: 'getEntireChromaticLp',
    walletAddress,
    markets,
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
      let chromaticLps = [] as ChromaticLp[];
      for (let index = 0; index < markets.length; index++) {
        const market = markets[index];

        const lpArray = await fetchChromaticLp({ lpClient, registry, walletAddress, market });
        chromaticLps = chromaticLps.concat(lpArray);
      }

      return chromaticLps.map((lpValue) => {
        const { totalValue, totalSupply, decimals, market } = lpValue;
        const settlementToken = tokens?.find((token) => token.address === market.tokenAddress);
        if (isNil(settlementToken)) {
          return {
            ...lpValue,
          };
        }
        if (totalSupply === 0n) {
          return { ...lpValue, settlementToken };
        }
        const lpPrice = divPreserved(totalValue, totalSupply, decimals);
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
    market: currentMarket,
    tokens,
  };
  const { setState: setStoredLpAddress } = useLocalStorage<Address>('app:lp');
  const dispatch = useAppDispatch();
  const {
    data: lpList,
    error,
    isLoading: isLpLoading,
  } = useSWR(
    isReady && checkAllProps(fetchKey) ? { ...fetchKey, walletAddress } : undefined,
    async ({ walletAddress, market, tokens }) => {
      const registry = lpClient.registry();
      const lpArray = await fetchChromaticLp({ lpClient, registry, walletAddress, market });
      return lpArray.map((lpValue) => {
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
        const lpPrice = divPreserved(totalValue, totalSupply, decimals);
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

  return { lpList, isLpLoading, onLpSelect };
};
