import { useMemo, useState } from 'react';
import { Logger } from '../utils/log';
// import { useBinsBySelectedMarket } from './useLiquidityPool';
import { useRangeChart } from '@chromatic-protocol/react-compound-charts';
import { BigNumber } from 'ethers';
import { isNil } from 'ramda';
import { CLB_TOKEN_VALUE_DECIMALS } from '../configs/decimals';
import { useLiquidityPool } from './useLiquidityPool';

const logger = Logger('usePoolInput');
const usePoolInput = () => {
  const { pool } = useLiquidityPool();
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
