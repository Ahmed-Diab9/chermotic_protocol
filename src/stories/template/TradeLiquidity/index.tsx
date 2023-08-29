import '~/stories/atom/Tabs/style.css';
import './style.css';
import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { Button } from '~/stories/atom/Button';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import ViewShortIcon from '~/assets/icons/ViewShortIcon';
import ViewLongIcon from '~/assets/icons/ViewLongIcon';
import ViewBothIcon from '~/assets/icons/ViewBothIcon';

export interface TradeLiquidityProps {}

export const TradeLiquidity = (props: TradeLiquidityProps) => {
  const [selectedButton, setSelectedButton] = useState(0);

  return (
    <div className="TradeLiquidity panel">
      <div className="flex items-stretch">
        <div className="flex items-center flex-auto px-3">
          <h4>Short LP</h4>
        </div>
        <Button
          iconOnly={<ViewShortIcon />}
          css="square"
          className={selectedButton === 0 ? 'bg-paper-lighter' : ''}
          onClick={() => setSelectedButton(0)}
        />
        <Button
          iconOnly={<ViewLongIcon />}
          css="square"
          className={selectedButton === 1 ? 'bg-paper-lighter' : ''}
          onClick={() => setSelectedButton(1)}
        />
        <Button
          iconOnly={<ViewBothIcon />}
          css="square"
          className={selectedButton === 2 ? 'bg-paper-lighter' : ''}
          onClick={() => setSelectedButton(2)}
        />
      </div>
      <div className="border-y h-[320px]"></div>
      <div className="flex items-center justify-end h-10">
        <Button
          label="Provide Liquidity"
          css="unstyled"
          iconRight={<ChevronRightIcon />}
          to={'/pool'}
        />
      </div>
    </div>
  );
};
