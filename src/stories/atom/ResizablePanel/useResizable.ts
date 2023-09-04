import { useState } from 'react';

interface ResizeOptions {
  initialWidth: number;
  initialHeight: number;
  minWidth: number;
  minHeight: number;
  maxHeight: number;
}

export const useResizable = (options: ResizeOptions) => {
  const { initialWidth, initialHeight, minWidth, minHeight, maxHeight } = options;

  const [width, setWidth] = useState<number>(initialWidth);
  const [height, setHeight] = useState<number>(initialHeight);

  const handleResizeStop = (
    e: MouseEvent | TouchEvent,
    direction: string,
    ref: HTMLElement,
    delta: { width: number; height: number }
  ): void => {
    setWidth(width + delta.width);
    setHeight(height + delta.height);
  };

  return {
    width,
    height,
    setWidth,
    setHeight,
    minWidth,
    minHeight,
    maxHeight,
    handleResizeStop,
  };
};
