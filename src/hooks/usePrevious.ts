import { isNotNil } from 'ramda';
import { useEffect, useRef } from 'react';

export const usePrevious = <T>(newValue: T, save?: boolean) => {
  const ref = useRef<T>();

  useEffect(() => {
    if (save) {
      if (isNotNil(newValue)) {
        ref.current = newValue;
      }
    } else {
      ref.current = newValue;
    }
  }, [newValue, save]);

  return ref.current;
};
