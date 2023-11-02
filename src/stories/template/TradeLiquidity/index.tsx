import '~/stories/atom/Tabs/style.css';
import './style.css';

import { useState } from 'react';

import { ChevronRightIcon } from '@heroicons/react/24/outline';
import ViewBothIcon from '~/assets/icons/ViewIcon';
import ViewLongIcon from '~/assets/icons/ViewLongIcon';
import ViewShortIcon from '~/assets/icons/ViewShortIcon';

import { Button } from '~/stories/atom/Button';
import { ResizablePanel } from '~/stories/atom/ResizablePanel';

export interface TradeLiquidityProps {}

export const TradeLiquidity = (props: TradeLiquidityProps) => {
  const [selectedButton, setSelectedButton] = useState(0);

  return (
    <div className="TradeLiquidity">
      <ResizablePanel
        initialWidth={240}
        initialHeight={400}
        minHeight={200}
        maxHeight={800}
        minWidth={240}
        className="flex flex-col panel"
        bottom
      >
        <div className="flex items-stretch">
          <div className="flex items-center flex-auto px-3">
            <h4>Short LP</h4>
          </div>
          <Button
            iconOnly={<ViewShortIcon />}
            css="square"
            className={selectedButton === 0 ? 'bg-paper-light' : ''}
            onClick={() => setSelectedButton(0)}
          />
          <Button
            iconOnly={<ViewLongIcon />}
            css="square"
            className={selectedButton === 1 ? 'bg-paper-light' : ''}
            onClick={() => setSelectedButton(1)}
          />
          <Button
            iconOnly={<ViewBothIcon />}
            css="square"
            className={selectedButton === 2 ? 'bg-paper-light' : ''}
            onClick={() => setSelectedButton(2)}
          />
        </div>
        <div className="flex-auto border-y"></div>
        <div className="flex items-center justify-end h-10">
          <Button
            label="Provide Liquidity"
            css="unstyled"
            iconRight={<ChevronRightIcon />}
            to={'/pool'}
          />
        </div>
      </ResizablePanel>
    </div>
  );
};
