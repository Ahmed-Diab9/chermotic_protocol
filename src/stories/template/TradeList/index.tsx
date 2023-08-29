import '~/stories/atom/Tabs/style.css';
import './style.css';
import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { Button } from '~/stories/atom/Button';
import { ChevronRightIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import ArrowTriangleIcon from '~/assets/icons/ArrowTriangleIcon';

const tradeListItems = [
  { direction: 'long', price: 2424.1212, amount: 0.1212, time: '10:00:30' },
  { direction: 'short', price: 2424.1212, amount: 0.1212, time: '11:00:00' },
];

export interface TradeListProps {}

export const TradeList = (props: TradeListProps) => {
  return (
    <div className="TradeList panel min-h-[236px]">
      <div className="flex items-stretch border-b">
        <div className="flex items-center flex-auto px-3">
          <h4>Trades</h4>
        </div>
        <Button iconOnly={<ArrowPathIcon />} css="square" />
      </div>
      <div className="table w-full px-3 py-2">
        <div className="table-row-group thead">
          <div className="tr">
            <span className="td">Price</span>
            <span className="td">Amount</span>
            <span className="td">Time</span>
          </div>
        </div>
        <div className="table-row-group tbody">
          {tradeListItems.map((trade, index) => (
            <div key={index} className="tr">
              <span className="td">
                <span className="flex items-center gap-[2px]">
                  {trade.price}
                  <span
                    className={
                      trade.direction === 'long'
                        ? 'text-price-higher rotate-180'
                        : 'text-price-lower'
                    }
                  >
                    <ArrowTriangleIcon />
                  </span>
                </span>
              </span>
              <span
                className={`td ${
                  trade.direction === 'long' ? 'text-price-higher' : 'text-price-lower'
                }`}
              >
                {trade.amount}
              </span>
              <span className="td">{trade.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
