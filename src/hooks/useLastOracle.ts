import { isNil } from 'ramda';
import { useEffect, useState } from 'react';
import { useMarket } from './useMarket';
import useOracleVersion from './useOracleVersion';

export function useLastOracle() {
  const { oracleVersions } = useOracleVersion();
  const { currentMarket } = useMarket();
  const [lapsed, setLapsed] = useState<{ hours: number; minutes: number; seconds: number }>(
    undefined!
  );

  useEffect(() => {
    if (isNil(oracleVersions) || isNil(currentMarket)) {
      return;
    }
    const currentVersion = oracleVersions[currentMarket.address];
    if (isNil(currentVersion) || isNil(currentVersion.timestamp)) {
      return;
    }
    let timerId = setTimeout(function onTimeout() {
      const now = new Date();
      const nowUtc = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds()
      );
      const value = nowUtc / 1000 - Number(currentVersion.timestamp);
      const hours = Math.floor(value / 3600);
      const minutes = Math.floor((value % 3600) / 60);
      const seconds = Math.floor((value % 3600) % 60);

      setLapsed({ hours, minutes, seconds });

      timerId = setTimeout(onTimeout, 1000);
    }, 1000);
    return () => {
      clearTimeout(timerId);
    };
  }, [oracleVersions, currentMarket]);

  return lapsed;
}
