import { useEffect, useRef, useState } from 'react';

type Size = {
  width: number | undefined;
  height: number | undefined;
};

interface Props {
  interval?: number;
  onResize?: (nextSize: Size) => unknown;
}

// FIXME: Should check if this method is effective.
export const useThrottledResize = (props: Props) => {
  const { interval = 1000, onResize } = props;
  const throttleRef = useRef(false);
  const [sizeData, setSizeData] = useState<Size>();

  useEffect(() => {
    const handleResize = () => {
      if (throttleRef.current) {
        return;
      }
      throttleRef.current = true;
      setTimeout(() => {
        const nextData = { width: window.innerWidth, height: window.innerHeight };
        setSizeData(nextData);
        onResize?.(nextData);

        throttleRef.current = false;
      }, interval);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [interval, onResize]);

  return {
    sizeData,
  };
};
