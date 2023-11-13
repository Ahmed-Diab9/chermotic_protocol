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
  transparent?: boolean;
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
        top: props.top || false,
        right: props.right || false,
        bottom: props.bottom || false,
        left: props.left || false,
        topRight: props.topRight || false,
        bottomRight: props.bottomRight || false,
        bottomLeft: props.bottomLeft || false,
        topLeft: props.topLeft || false,
      }}
      onResizeStop={handleResizeStop}
      className={props.className}
      style={{
        background: props.transparent ? 'transparent' : undefined,
      }}
      handleWrapperClass="wrapper-handle"
    >
      {props.children}
    </Resizable>
  );
};
