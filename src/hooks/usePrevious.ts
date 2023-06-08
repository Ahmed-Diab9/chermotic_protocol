import { useEffect, useRef } from "react";
import { isValid } from "~/utils/valid";

export const usePrevious = <T>(newValue: T, save?: boolean) => {
  const ref = useRef<T>();

  useEffect(() => {
    if (save) {
      if (isValid(newValue)) {
        ref.current = newValue;
      }
    } else {
      ref.current = newValue;
    }
  }, [newValue, save]);

  return ref.current;
};
