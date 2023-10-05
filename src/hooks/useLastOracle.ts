import { isNil, isNotNil } from 'ramda';
import { useEffect, useMemo, useState } from 'react';
import { useMarket } from './useMarket';

const formatter = Intl.DateTimeFormat('en-US', {
  second: '2-digit',
  minute: '2-digit',
  hour: '2-digit',
  hourCycle: 'h23',
  timeZone: 'UTC',
});
const preformat = (elapsed: number) => {
  return formatter.formatToParts(elapsed);
};

interface Props {
  format: (item: Intl.DateTimeFormatPart) => string;
}

export function useLastOracle(props?: Props) {
  const { currentMarket } = useMarket();
  const [elapsed, setElapsed] = useState<number>();

  useEffect(() => {
    const timestamp = currentMarket?.oracleValue?.timestamp;
    if (isNil(timestamp)) return;
    let timerId: NodeJS.Timeout;
    timerId = setInterval(() => {
      const timeDiff = Date.now() - Number(timestamp) * 1000;
      setElapsed(timeDiff);
    }, 1000);

    return () => {
      clearTimeout(timerId);
    };
  }, [currentMarket]);

  const formattedElapsed = useMemo(() => {
    if (isNil(elapsed)) {
      return;
    }
    if (isNotNil(props)) {
      return preformat(elapsed).map(props.format);
    }
    return preformat(elapsed)
      .map(({ type, value }) => {
        switch (type) {
          case 'hour': {
            return `${value}h`;
          }
          case 'minute': {
            return `${value}m`;
          }
          case 'second': {
            return `${value}s`;
          }
          case 'literal': {
            return '';
          }
          case 'dayPeriod': {
            return '';
          }
          default:
            return value;
        }
      })
      .join(' ');
  }, [elapsed, props]);

  return { elapsed, formattedElapsed };
}
