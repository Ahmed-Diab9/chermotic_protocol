import { Resizable } from 're-resizable';
import { PropsWithChildren } from 'react';

import { useResizable } from '~/stories/atom/ResizablePanel/useResizable';

interface ResizablePanelProps extends PropsWithChildren {
  className?: string;
  initialWidth: number;
  initialHeight: number;
  minHeight: number;
  maxHeight: number;
  minWidth: number;
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
  topRight?: boolean;
  bottomRight?: boolean;
  bottomLeft?: boolean;
  topLeft?: boolean;
  autoWidth?: boolean;
  autoHeight?: boolean;
}

export const ResizablePanel = (props: ResizablePanelProps) => {
  const { width, height, minHeight, maxHeight, handleResizeStop } = useResizable({
    initialWidth: props.initialWidth,
    initialHeight: props.initialHeight,
    minHeight: props.minHeight,
    maxHeight: props.maxHeight,
    minWidth: props.minWidth,
  });

  return (
    <Resizable
      size={{
        width: props.autoWidth ? 'auto' : width,
        height: props.autoHeight ? 'auto' : height,
      }}
      minHeight={minHeight}
      maxHeight={maxHeight}
      enable={{
        top: props.top,
        right: props.right,
        bottom: props.bottom,
        left: props.left,
        topRight: props.topRight,
        bottomRight: props.bottomRight,
        bottomLeft: props.bottomLeft,
        topLeft: props.topLeft,
      }}
      onResizeStop={handleResizeStop}
      className={props.className}
    >
      {props.children}
    </Resizable>
  );
};
