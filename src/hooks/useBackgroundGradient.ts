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

  function changeBackground(state: any) {
    const prevBackground = document.querySelector('#gradient #prev') as HTMLElement;
    const currentBackground = document.querySelector('#gradient #current') as HTMLElement;

    if (currentBackground && prevBackground) {
      prevBackground.className = currentBackground.className;
      prevBackground.style.opacity = '1';
      currentBackground.style.opacity = '0';

      setTimeout(() => {
        currentBackground.className = `bg-${state}`;
        prevBackground.style.opacity = '0';
        currentBackground.style.opacity = '1';
      }, 0);
    }
  }

  useEffect(() => {
    if (!backgroundRef.current) {
      return;
    }

    if (beforeCondition && afterCondition) {
      changeBackground('higher-higher');
    } else if (beforeCondition) {
      changeBackground('higher-lower');
    } else if (afterCondition) {
      changeBackground('lower-higher');
    } else {
      changeBackground('lower-lower');
    }
  }, [beforeCondition, afterCondition]);

  return { beforeCondition, afterCondition, toggleConditions, onLoadBackgroundRef };
}

export default useBackgroundGradient;
