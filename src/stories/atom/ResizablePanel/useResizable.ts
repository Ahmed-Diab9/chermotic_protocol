import { useState } from 'react';

interface ResizeOptions {
  initialWidth: number;
  initialHeight: number;
  minHeight: number;
  maxHeight: number;
}

export const useResizable = (options: ResizeOptions) => {
  const { initialWidth, initialHeight, minHeight, maxHeight } = options;

  const [width, setWidth] = useState<number>(initialWidth);
  const [height, setHeight] = useState<number>(initialHeight);

  const handleResizeStop = (
    e: MouseEvent | TouchEvent,
    direction: string,
    ref: HTMLElement,
    delta: { width: number; height: number }
  ): void => {
    setHeight(height + delta.height);
  };

  return {
    width,
    height,
    setWidth,
    setHeight,
    minHeight,
    maxHeight,
    handleResizeStop,
  };
};
