import { isNil, isNotNil } from 'ramda';
import { useEffect, useMemo, useState } from 'react';
import { Market } from '~/typings/market';
import useMarketOracle from './commons/useMarketOracle';

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
  market?: Market;
  format?: (item: Intl.DateTimeFormatPart) => string;
}

export function useLastOracle(props?: Props) {
  const { market, format } = props ?? {};
  const { currentOracle } = useMarketOracle({ market });
  const [elapsed, setElapsed] = useState<number>();

  useEffect(() => {
    const timestamp = currentOracle?.timestamp;
    if (isNil(timestamp)) return;
    let timerId: NodeJS.Timeout;
    timerId = setInterval(() => {
      const timeDiff = Date.now() - Number(timestamp) * 1000;
      setElapsed(timeDiff);
    }, 1000);

    return () => {
      clearTimeout(timerId);
    };
  }, [currentOracle?.timestamp]);

  const formattedElapsed = useMemo(() => {
    if (isNil(elapsed)) {
      return;
    }
    if (isNotNil(format)) {
      return preformat(elapsed).map(format);
    }
    return preformat(elapsed).map(({ type, value }) => {
      switch (type) {
        case 'hour': {
          return `${value}`;
        }
        case 'minute': {
          return `${value}`;
        }
        case 'second': {
          return `${value}`;
        }
        case 'literal': {
          return ':';
        }
        case 'dayPeriod': {
          return '';
        }
        default:
          return value;
      }
    });
  }, [elapsed, format]);

  return { elapsed, formattedElapsed };
}
