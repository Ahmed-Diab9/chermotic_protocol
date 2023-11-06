import { Listbox } from '@headlessui/react';
import AprIcon from '~/assets/images/pool_apr.svg';
import ProfitIcon from '~/assets/images/pool_profit.svg';
import { Avatar } from '~/stories/atom/Avatar';
import { Thumbnail } from '~/stories/atom/Thumbnail';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';

import { isNotNil } from 'ramda';
import { usePoolPerformance } from './hooks';
import './style.css';

export interface PoolPerformanceProps {}

export const PoolPerformance = (props: PoolPerformanceProps) => {
  const {
    tokenName,
    tokenImage,
    performance,
    period,
    trailingApr,
    formattedPeriods,
    onPeriodChange,
  } = usePoolPerformance();

  return (
    <div className="p-5 PoolPerformance">
      <div className="flex justify-between">
        <div className="text-left">
          <h3 className="mb-1">CLP Performance</h3>
          <span className="inline-flex py-1 pl-1 pr-2 rounded-full bg-paper-light">
            <Avatar size="xs" label={tokenName} gap="1" src={tokenImage} />
          </span>
        </div>
        <div className="w-[140px] select">
          <Listbox
            value={period}
            onChange={(selectedValue) => {
              const nextIndex = formattedPeriods.findIndex(
                (formattedPeriod) => formattedPeriod === selectedValue
              );
              if (isNotNil(nextIndex)) {
                onPeriodChange(nextIndex);
              }
            }}
          >
            <Listbox.Button>{period}</Listbox.Button>
            <Listbox.Options>
              {formattedPeriods.map((period) => (
                <Listbox.Option key={period} value={period} disabled={false}>
                  {period}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Listbox>
        </div>
      </div>
      <div className="pt-5 mt-3 border-t">
        <div className="flex">
          <div className="flex w-1/2 gap-3 pr-5">
            <Thumbnail className="w-12 h-12 !bg-transparent" src={ProfitIcon} />
            <div className="text-left text-primary-light">
              <div className="flex">
                <p>Profit</p>
                <TooltipGuide
                  label="performance-profit"
                  tip="The Profit of LP during the period(including unrealized PnL)"
                  outLink=""
                />
              </div>
              {/* todo: text price color */}
              <h4 className="text-price-higher mt-[2px]">{performance}%</h4>
            </div>
          </div>
          <div className="flex w-1/2 gap-3 pl-5 border-l">
            <Thumbnail className="w-12 h-12 !bg-transparent" src={AprIcon} />
            <div className="text-left text-primary-light">
              <div className="flex">
                <p>Trailing APR</p>
                <TooltipGuide
                  label="performance-trailing-apr"
                  tip="APR estimated based on the profit during the period"
                  outLink=""
                />
              </div>
              {/* todo: text price color */}
              <h4 className="text-price-higher mt-[2px]">{trailingApr}%</h4>
            </div>
          </div>
        </div>

        {/* <div className="p-3 mt-4 rounded bg-paper-light">
          <div className="flex border-b border-paper-light">
            <div className="w-1/2 pb-3 pr-3">
              <PoolPerformanceItem title="Trade Fees" value={12526.02} price={101.373} />
            </div>
            <div className="w-1/2 pb-3 pl-3 border-l border-paper-light">
              <PoolPerformanceItem title="Maker PnL" value={-2061.99} price={-45555.55} />
            </div>
          </div>
          <div className="flex">
            <div className="w-1/2 pt-3 pr-3">
              <PoolPerformanceItem title="Liquidity Fees" value={58.12} price={71.373} />
            </div>
            <div className="w-1/2 pt-3 pl-3 border-l border-paper-light">
              <PoolPerformanceItem title="esChroma Rewards" value={16405.373} price={401.373} />
            </div>
          </div>
        </div> */}
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
      <p className="text-sm text-primary-light">{title}</p>
      <p className="mt-[6px] mb-[2px]">{value} USDC</p>
      {/* when price < 0 : "-" should be in front of "$" */}
      <p className="text-sm text-primary-lighter">${price}</p>
    </div>
  );
};
