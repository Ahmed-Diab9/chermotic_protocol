import { useMemo, useState } from 'react';
import { useAccount, useSigner } from 'wagmi';
import { useAppSelector } from '../store';
import { Logger, errorLog } from '../utils/log';
import { bigNumberify, expandDecimals } from '../utils/number';
import { isValid } from '../utils/valid';
import { useTokenBalances } from './useTokenBalance';
import { useChromaticClient } from './useChromaticClient';
// import { useBinsBySelectedMarket } from './useLiquidityPool';
import { useRangeChart } from '@chromatic-protocol/react-compound-charts';
import { BigNumber } from 'ethers';
import { isNil } from 'ramda';
import { CLB_TOKEN_VALUE_DECIMALS } from '../configs/decimals';
import { useLiquiditiyPool } from './useLiquidityPool';
import usePoolReceipt from './usePoolReceipt';

const logger = Logger('usePoolInput');
const usePoolInput = () => {
  const { pool } = useLiquiditiyPool();
  const market = useAppSelector((state) => state.market.selectedMarket);
  const { client } = useChromaticClient();
  const routerApi = client?.router();
  const token = useAppSelector((state) => state.token.selectedToken);
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const { data: signer } = useSigner();
  const { fetchReceipts } = usePoolReceipt();
  const { fetchTokenBalances: fetchWalletBalances } = useTokenBalances();

  const {
    data: { values: binFeeRates },
    setData: onRangeChange,
    ref: rangeChartRef,
    move,
  } = useRangeChart();

  const [amount, setAmount] = useState('');

  const rates = useMemo<[number, number]>(
    () => [binFeeRates[0], binFeeRates[binFeeRates!.length - 1]],
    [binFeeRates]
  );

  const clbTokenAverage = useMemo(() => {
    if (isNil(pool)) {
      return;
    }
    logger.info('binFeeRates', binFeeRates);
    const totalCLBTokenValue = binFeeRates.reduce((acc, bin) => {
      const clbTokenValue = BigNumber.from(
        Math.floor(
          (pool.bins.find(({ baseFeeRate }) => {
            return baseFeeRate / 100 === bin;
          })?.clbTokenValue || 0) *
            10 ** CLB_TOKEN_VALUE_DECIMALS
        )
      );
      return acc.add(clbTokenValue);
    }, BigNumber.from(0));

    return binFeeRates.length ? totalCLBTokenValue.div(binFeeRates.length) : 0;
  }, [pool, binFeeRates]);

  const onAmountChange = (value: string) => {
    const parsed = Number(value);
    if (isNaN(parsed)) {
      return;
    }
    setAmount(value);
  };

  const onAddLiquidity = async () => {
    logger.info('add liq');
    if (!isValid(signer)) {
      errorLog('signer is invalid');
      return;
    }
    if (!isValid(token)) {
      errorLog('token is not selected');
      return;
    }
    if (!isValid(market)) {
      errorLog('market is not selected');
      return;
    }
    if (!isValid(address)) {
      errorLog('wallet not connected');
      return;
    }
    if (!isValid(routerApi)) {
      errorLog('no router apis');
      return;
    }
    setIsLoading(true);
    try {
      const marketAddress = market?.address;
      const expandedAmount = bigNumberify(amount)?.mul(expandDecimals(token.decimals));
      if (!isValid(expandedAmount)) {
        errorLog('amount is invalid');
        return;
      }
      const dividedAmount = expandedAmount.div(binFeeRates.length);

      await routerApi.addLiquidities(
        marketAddress,
        binFeeRates.map((feeRate: any) => ({
          feeRate: +(feeRate * 10 ** 2).toFixed(0),
          amount: dividedAmount,
        }))
      );

      await fetchReceipts();
      await fetchWalletBalances();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    amount,
    rates,
    binCount: binFeeRates.length,
    binAverage: clbTokenAverage,
    isLoading,
    onAmountChange,
    onRangeChange,
    onAddLiquidity,
    rangeChartRef,
    move: move(),
  };
};

export default usePoolInput;
