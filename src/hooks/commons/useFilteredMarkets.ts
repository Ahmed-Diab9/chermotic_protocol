import { isNil } from 'ramda';
import useSWR from 'swr';
import { Address } from 'wagmi';
import { MARKET_LOGOS } from '~/configs/token';
import { useAppSelector } from '~/store';
import { checkAllProps } from '~/utils';
import { PromiseOnlySuccess } from '~/utils/promise';
import { useChromaticClient } from '../useChromaticClient';
import { useError } from '../useError';
import { usePositionFilter } from '../usePositionFilter';
import { useSettlementToken } from '../useSettlementToken';

const useFilteredMarkets = () => {
  const { filterOption } = usePositionFilter();
  const { tokens, currentToken } = useSettlementToken();
  const { client } = useChromaticClient();
  const currentMarket = useAppSelector((state) => state.market.selectedMarket);

  const fetchKey = {
    filterOption,
    tokens,
    currentToken,
  };
  const {
    data: markets,
    isLoading,
    error,
  } = useSWR(
    checkAllProps(fetchKey) ? { ...fetchKey, currentMarket } : undefined,
    async ({ filterOption, tokens, currentToken, currentMarket }) => {
      const marketFactoryApi = client.marketFactory();
      let finalAddresses = [] as { address: Address; tokenAddress: Address }[];
      if (filterOption !== 'ALL') {
        let marketAddresses = (await marketFactoryApi
          .contracts()
          .marketFactory.read.getMarketsBySettlmentToken([currentToken.address])) as Address[];
        if (filterOption === 'MARKET_ONLY') {
          const foundAddress = marketAddresses.find(
            (address) => address === currentMarket?.address
          );
          if (isNil(foundAddress)) {
            marketAddresses = [marketAddresses[0]];
          } else {
            marketAddresses = [foundAddress];
          }
        }
        finalAddresses = marketAddresses.map((address) => ({
          address,
          tokenAddress: currentToken.address,
        }));
      } else {
        const response = await PromiseOnlySuccess(
          tokens.map(async (token) => {
            const marketAddresses = await marketFactoryApi
              .contracts()
              .marketFactory.read.getMarketsBySettlmentToken([token.address]);
            return [token.address, marketAddresses] as const;
          })
        );
        finalAddresses = response.reduce((markets, [tokenAddress, marketAddresses]) => {
          markets = markets.concat(marketAddresses.map((address) => ({ address, tokenAddress })));

          return markets;
        }, [] as { address: Address; tokenAddress: Address }[]);
      }
      const marketApi = client.market();
      const markets = await PromiseOnlySuccess(
        finalAddresses.map(async ({ address, tokenAddress }) => {
          const description = await marketApi.getMarketName(address);
          const [prefix, suffix] = description.split(/\s*\/\s*/) as [string, string];

          return {
            address,
            tokenAddress,
            description: `${prefix}/${suffix}`,
            image: MARKET_LOGOS[prefix],
          };
        })
      );

      return markets;
    }
  );

  useError({ error });

  return { markets, currentMarket, isLoading };
};

export default useFilteredMarkets;
