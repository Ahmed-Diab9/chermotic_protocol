import { useRangeChart } from '@chromatic-protocol/react-compound-charts';
import { isNil } from 'ramda';
import { useMemo, useState } from 'react';
import { Logger } from '../utils/log';
import { useLiquidityPool } from './useLiquidityPool';

const logger = Logger('usePoolInput');
const usePoolInput = () => {
  const { liquidityPool: pool } = useLiquidityPool();
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
      const clbTokenValue =
        (pool.bins.find(({ baseFeeRate }) => {
          return baseFeeRate / 100 === bin;
        })?.clbTokenValue || 0n) * 1n;
      return acc + clbTokenValue;
    }, 0n);
    return binFeeRates.length ? totalCLBTokenValue / BigInt(binFeeRates.length) : 0n;
  }, [pool, binFeeRates]);

  const onAmountChange = (value: string) => {
    value = value.replace(/,/g, '');
    const parsed = Number(value);
    if (isNaN(parsed)) {
      return;
    }
    setAmount(value);
  };

  return {
    amount,
    rates,
    binFeeRates,
    binCount: binFeeRates.length,
    binAverage: clbTokenAverage,
    onAmountChange,
    onRangeChange,
    rangeChartRef,
    move: move(),
  };
};

export default usePoolInput;
