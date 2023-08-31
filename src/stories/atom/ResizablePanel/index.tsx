import { useState } from 'react';
import { Resizable } from 're-resizable';

interface ResizablePanelProps {
  className?: string;
}

export const ResizablePanel = (props: ResizablePanelProps) => {
  const [height, setHeight] = useState<number>(200);

  const handleResizeStop = (
    e: MouseEvent | TouchEvent,
    direction: string,
    ref: HTMLElement,
    delta: { width: number; height: number }
  ): void => {
    setHeight(height + delta.height);
  };

  return (
    <Resizable
      size={{ width: 300, height }}
      minHeight={100}
      maxHeight={400}
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
      <div className=" panel-content">
        <p>This is a resizable panel with dynamic size.</p>
        <p>You can add more content here.</p>
      </div>
    </Resizable>
  );
};
