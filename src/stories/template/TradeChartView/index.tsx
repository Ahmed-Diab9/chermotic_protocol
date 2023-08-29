import '~/stories/atom/Tabs/style.css';
import './style.css';
import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { Button } from '~/stories/atom/Button';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import ViewShortIcon from '~/assets/icons/ViewShortIcon';
import ViewLongIcon from '~/assets/icons/ViewLongIcon';
import ViewBothIcon from '~/assets/icons/ViewBothIcon';

export interface TradeChartViewProps {}

export const TradeChartView = (props: TradeChartViewProps) => {
  const [selectedButton, setSelectedButton] = useState(0);

  return (
    <div className="TradeChartView panel">
      <div className="flex items-stretch">
        <div className="flex items-center flex-auto px-3">{/* <h4>Last Price</h4> */}</div>
        <Button iconOnly={<ChevronRightIcon />} css="square" />
      </div>
      <div className="border-y h-[360px]"></div>
    </div>
  );
};
