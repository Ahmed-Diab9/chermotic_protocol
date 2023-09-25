import { isNil } from 'ramda';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useMarket } from './useMarket';
import { usePreviousOracle } from './usePreviousOracle';

function useBackgroundGradient() {
  const { currentMarket } = useMarket();
  const { previousOracle } = usePreviousOracle({ market: currentMarket });
  const backgroundRef = useRef<HTMLDivElement | null>(null);

  const [beforeCondition, setBeforeCondition] = useState<boolean>();
  const [afterCondition, setAfterCondition] = useState<boolean>();
  const checkCondition = useCallback((): [boolean, boolean] => {
    if (isNil(currentMarket) || isNil(previousOracle)) {
      return [false, false];
    }
    const currentPrice = currentMarket?.oracleValue.price;
    const isIncreasedNow = currentPrice - previousOracle.oracleBefore1Day.price > 0n;
    if (isNil(previousOracle.oracleBefore2Days)) {
      return [true, isIncreasedNow];
    }
    const isIncreasedBefore1Day =
      previousOracle.oracleBefore1Day.price - previousOracle.oracleBefore2Days.price > 0n;
    return [isIncreasedBefore1Day, isIncreasedNow];
  }, [currentMarket, previousOracle]);

  const onLoadBackgroundRef = (element: HTMLDivElement | null) => {
    backgroundRef.current = element;
  };

  const toggleConditions = (beforeOrAfter: 'before' | 'after') => {
    switch (beforeOrAfter) {
      case 'before': {
        setBeforeCondition((condition) => !condition);
        break;
      }
      case 'after': {
        setAfterCondition((condition) => !condition);
        break;
      }
    }
  };

  useEffect(() => {
    const isIncreased = checkCondition();
    setBeforeCondition(isIncreased[0]);
    setAfterCondition(isIncreased[1]);
  }, [checkCondition]);

  useEffect(() => {
    if (!backgroundRef.current) {
      return;
    }

    if (beforeCondition && afterCondition) {
      backgroundRef.current.style.background = 'rgb(var(--color-price-higher-light) / 0.19)';
    } else if (beforeCondition) {
      backgroundRef.current.style.background =
        'linear-gradient(90deg, rgb(var(--color-price-higher-light) / 0.19) 0%, rgb(var(--color-price-lower-light) / 0.19) 100%)';
    } else if (afterCondition) {
      backgroundRef.current.style.background =
        'linear-gradient(90deg, rgb(var(--color-price-lower-light) / 0.19) 0%, rgb(var(--color-price-higher-light) / 0.19) 100%)';
    } else {
      backgroundRef.current.style.background = 'rgb(var(--color-price-lower-light) / 0.19)';
    }
  }, [beforeCondition, afterCondition]);

  return { beforeCondition, afterCondition, toggleConditions, onLoadBackgroundRef };
}

export default useBackgroundGradient;
