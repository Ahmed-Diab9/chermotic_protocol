import { useState } from 'react';
import { Listbox } from '@headlessui/react';
import { Avatar } from '~/stories/atom/Avatar';
import { Thumbnail } from '~/stories/atom/Thumbnail';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import './style.css';

export interface PoolPerformanceProps {}

const selectItem = [
  { id: 1, title: 'a week', unavailable: false },
  { id: 2, title: 'a month', unavailable: false },
  { id: 3, title: '3 monthes', unavailable: false },
  { id: 4, title: '6 monthes', unavailable: false },
  { id: 5, title: 'a year', unavailable: false },
  { id: 6, title: 'All time', unavailable: false },
];

export const PoolPerformance = (props: PoolPerformanceProps) => {
  const [selectedItem, setSelectedItem] = useState(selectItem[0]);

  return (
    <div className="p-5 PoolPerformance panel">
      <div className="flex justify-between">
        <div className="text-left">
          <h4>CLP Performance</h4>
          <div className="flex gap-1 mt-1">
            <p className="text-primary-light">Unit:</p>
            <Avatar size="xs" label="ETH" gap="1" />
          </div>
        </div>
        <div className="w-[140px] select">
          <Listbox value={selectedItem} onChange={setSelectedItem}>
            <Listbox.Button>{selectedItem.title}</Listbox.Button>
            <Listbox.Options>
              {selectItem.map((item) => (
                <Listbox.Option key={item.id} value={item} disabled={item.unavailable}>
                  {item.title}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Listbox>
        </div>
      </div>
      <div className="pt-4 mt-3 border-t">
        <div className="flex">
          <div className="flex w-1/2 gap-3 pr-5">
            <Thumbnail className="w-12 h-12" />
            <div className="text-left text-primary-light">
              <p>Profit</p>
              {/* todo: text price color */}
              <h4 className="text-price-higher mt-[2px]">13,526.03</h4>
              <p className="text-sm">($101.33)</p>
            </div>
          </div>
          <div className="flex w-1/2 gap-3 pl-5 border-l">
            <Thumbnail className="w-12 h-12" />
            <div className="text-left text-primary-light">
              <div className="flex">
                <p>Trailing APR</p>
                <TooltipGuide label="Trailing-apr" tip="tooltip" />
              </div>
              {/* todo: text price color */}
              <h4 className="text-price-higher mt-[2px]">7.54%</h4>
            </div>
          </div>
        </div>
        <div className="p-3 mt-4 rounded bg-paper-lighter">
          <div className="flex border-b">
            <div className="w-1/2 pb-3 pr-3">
              <PoolPerformanceItem title="Trade Fees" value={101.373} price={101.373} />
            </div>
            <div className="w-1/2 pb-3 pl-3 border-l">
              <PoolPerformanceItem title="Maker PnL" value={101.373} price={101.373} />
            </div>
          </div>
          <div className="flex">
            <div className="w-1/2 pt-3 pr-3">
              <PoolPerformanceItem title="Liquidity Fees" value={101.373} price={101.373} />
            </div>
            <div className="w-1/2 pt-3 pl-3 border-l">
              <PoolPerformanceItem title="esChroma Rewards" value={101.373} price={101.373} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PoolPerformanceItemProps {
  title: string;
  value: number;
  price: number;
}

export const PoolPerformanceItem = (props: PoolPerformanceItemProps) => {
  const { title, value, price } = props;

  return (
    <div className="text-center text-primary">
      <p className="text-sm">{title}</p>
      <p className="mt-[6px] mb-[2px]">{value} USDC</p>
      <p className="text-sm text-primary-lighter">${price}</p>
    </div>
  );
};
