import useSWR from 'swr';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { useMarket } from './useMarket';

import { LEVERAGE_DECIMALS } from '~/configs/decimals';

import { checkAllProps } from '~/utils';
import { formatDecimals } from '~/utils/number';

export const useOracleProperties = () => {
  const { isReady, client } = useChromaticClient();
  const { currentMarket } = useMarket();

  const fetchKeyData = {
    name: 'useOracleProperties',
    marketAddress: currentMarket?.address,
  };

  const format = (value: number) => Number(formatDecimals(value, LEVERAGE_DECIMALS));

  const {
    data: oracleProperties,
    error,
    isLoading,
  } = useSWR(isReady && checkAllProps(fetchKeyData) && fetchKeyData, async ({ marketAddress }) => {
    const marketApi = client.market();
    const oracleProvider = await marketApi.oracleProvider(marketAddress);

    const marketFactoryApi = client.marketFactory();
    const properties = await marketFactoryApi.getOracleProviderProperties(oracleProvider);

    const tier = properties.leverageLevel;
    const minTakeProfit = format(properties.minTakeProfitBPS);
    const maxTakeProfit = format(properties.maxTakeProfitBPS);
    // TODO: move into components
    const maxLeverage = tier === 1 ? 20 : 10;
    const minStopLoss = 100 / maxLeverage;

    return {
      tier,
      minTakeProfit,
      maxTakeProfit,
      maxLeverage,
      minStopLoss,
    };
  });

  useError({ error });

  return { oracleProperties, isLoading };
};
