import { useCallback, useEffect } from "react";
import { infoLog } from "../utils/log";

type Callback = (...args: any[]) => void;
type Props<T extends unknown = unknown> = [...T[], Callback | T | undefined];

const useConsole = (...props: Props) => {
  const onConsole = useCallback(() => {
    const endIndex = props.length - 1;
    const endValue = props[endIndex];
    if (endValue instanceof Function) {
      const log = endValue as Callback;
      log(...props.slice(0, endIndex));
    } else {
      infoLog(...props);
    }
  }, [props]);

  useEffect(() => {
    onConsole();
  }, [onConsole]);
};

export default useConsole;
