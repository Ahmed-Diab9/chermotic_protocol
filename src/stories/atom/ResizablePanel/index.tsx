import { Resizable } from 're-resizable';
import { useResizable } from '~/stories/atom/ResizablePanel/useResizable';

interface ResizablePanelProps {
  // className?: string;
}

export const ResizablePanel = (props: ResizablePanelProps) => {
  const { width, height, minHeight, maxHeight, handleResizeStop } = useResizable({
    initialWidth: 300,
    initialHeight: 200,
    minHeight: 100,
    maxHeight: 400,
  });

  return (
    <Resizable
      size={{ width, height }}
      minHeight={minHeight}
      maxHeight={maxHeight}
      enable={{
        top: true,
        right: false,
        bottom: true,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }}
      onResizeStop={handleResizeStop}
      className="border !border-primary"
    >
      Sample with resizable vertical height
    </Resizable>
  );
};
