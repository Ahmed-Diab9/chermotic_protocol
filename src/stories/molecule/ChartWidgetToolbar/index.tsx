import '~/stories/atom/Select/style.css';
import '~/stories/atom/Toggle/style.css';
import { useState } from 'react';
import { Button } from '~/stories/atom/Button';
import { Listbox } from '@headlessui/react';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';

export interface ChartWidgetToolbarProps {}

const selectItem = [
  { id: 1, title: 'Index Price' },
  { id: 2, title: 'Mark Price' },
  { id: 3, title: 'Last Price' },
];

export const ChartWidgetToolbar = (props: ChartWidgetToolbarProps) => {
  const {} = props;
  const [selectedItem, setSelectedItem] = useState(selectItem[2]);

  return (
    <div className="flex items-baseline justify-between w-full ChartWidgetToolbar">
      <div className="flex items-center">
        <ToolbarInterval />
        <div className="h-5 pl-2 ml-2 border-l" />
        <div className="select select-simple min-w-[112px]">
          <Listbox value={selectedItem} onChange={setSelectedItem}>
            <Listbox.Button className="!m-0 !justify-start">{selectedItem.title}</Listbox.Button>
            <Listbox.Options>
              {selectItem.map((item) => (
                <Listbox.Option key={item.id} value={item}>
                  {item.title}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Listbox>
        </div>
      </div>
      <div className="flex items-center">
        <ToolbarChart />
        <div className="h-5 pl-2 ml-2 border-l" />
        <Button
          iconOnly={<ArrowsPointingOutIcon />}
          css="unstyled"
          className="text-primary-light"
        />
      </div>
    </div>
  );
};

interface ToolbarIntervalProps {
  value?: string;
  onClick?: (nextValue: number) => unknown;
}

const ToolbarInterval = ({ value = '10H', onClick }: ToolbarIntervalProps) => {
  const INTERVAL_LIST = ['5M', '1H', '5H', '10H', '1D', '1W', '1M', 'All'];
  const [selectedInterval, setSelectedInterval] = useState(value);

  return (
    <div className="flex items-center gap-0">
      {INTERVAL_LIST.map((interval) => {
        const isActive = selectedInterval === interval;
        return (
          <div className="flex gap-4">
            <Button
              label={interval}
              css="unstyled"
              className={isActive ? 'text-primary' : 'text-primary-lighter'}
              onClick={() => {
                setSelectedInterval(interval);
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

interface ToolbarChartProps {
  value?: string;
  onClick?: (nextValue: number) => unknown;
}

const ToolbarChart = ({ value = 'Widget', onClick }: ToolbarChartProps) => {
  const CHART_LIST = ['Widget', 'Trading View'];
  const [selectedChart, setSelectedChart] = useState(value);

  return (
    <div className="flex items-center gap-0">
      {CHART_LIST.map((interval) => {
        const isActive = selectedChart === interval;
        return (
          <div className="flex gap-4">
            <Button
              label={interval}
              css="unstyled"
              className={isActive ? 'text-primary' : 'text-primary-light'}
              onClick={() => {
                setSelectedChart(interval);
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
