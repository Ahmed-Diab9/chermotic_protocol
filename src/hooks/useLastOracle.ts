import { isNil } from 'ramda';
import { useEffect, useState } from 'react';
import { padTimeZero } from '~/utils/number';
import { useMarket } from './useMarket';

export function useLastOracle() {
  const { currentMarket } = useMarket();
  const [lapsed, setLapsed] = useState<
    { hours: string; minutes: string; seconds: string } | undefined
  >(undefined);

  useEffect(() => {
    const timestamp = currentMarket?.oracleValue?.timestamp;
    if (isNil(timestamp)) return;

    let timerId = setTimeout(function onTimeout() {
      const timeDiff = Date.now() / 1000 - Number(timestamp);
      const hours = Math.floor(timeDiff / 3600);
      const minutes = Math.floor((timeDiff % 3600) / 60);
      const seconds = Math.floor((timeDiff % 3600) % 60);

      setLapsed({
        hours: padTimeZero(hours),
        minutes: padTimeZero(minutes),
        seconds: padTimeZero(seconds),
      });

      timerId = setTimeout(onTimeout, 1000);
    }, 1000);
    return () => {
      clearTimeout(timerId);
    };
  }, [currentMarket]);

  return lapsed;
}
