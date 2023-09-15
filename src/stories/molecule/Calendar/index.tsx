import { useState, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getYear, getMonth } from 'date-fns';
import enGB from 'date-fns/locale/en-GB';

import { Button } from '~/stories/atom/Button';
import { Listbox } from '@headlessui/react';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import '~/stories/atom/Select/style.css';
import './style.css';

registerLocale('en-GB', enGB);

export interface CalendarProps {}

export function Calendar(props: CalendarProps) {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);

  const onChange = (dates: any) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <DatePicker
      dateFormat="yyyy/MM/dd"
      selected={startDate}
      onChange={onChange}
      startDate={startDate}
      endDate={endDate}
      selectsRange
      popperPlacement="bottom-end"
      customInput={<DatePickerInput />}
      renderCustomHeader={CustomDatePickerHeader}
      // className="Calendar"
      calendarClassName="Calendar"
    />
  );
}

const DatePickerInput: React.FC<{
  value?: string;
  ref?: string;
  onClick?: () => void;
}> = ({ value, onClick, ref }) => {
  return (
    <button className="example-custom-input" onClick={onClick} ref={ref}>
      {value}
    </button>
  );
};

const CustomDatePickerHeader: React.FC<{
  date: Date;
  monthDate: Date;
  changeYear: (year: number) => void;
  changeMonth: (month: number) => void;
  decreaseMonth: () => void;
  increaseMonth: () => void;
  prevMonthButtonDisabled: boolean;
  nextMonthButtonDisabled: boolean;
}> = ({
  date,
  monthDate,
  changeYear,
  changeMonth,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
}) => {
  const years: number[] = [];
  for (let year = 2020; year <= getYear(new Date()); year++) {
    years.push(year);
  }

  const months: string[] = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <div>
      <div className="flex text-left">
        <div className="flex flex-col w-1/2">
          <button className="btn-inner">A Week ago</button>
          <button className="btn-inner selected">A Month ago</button>
          <button className="btn-inner">3 Month ago</button>
        </div>
        <div className="flex flex-col w-1/2 border-l">
          <button className="btn-inner">6 Month ago</button>
          <button className="btn-inner">1 Year ago</button>
          <button className="btn-inner">All time</button>
        </div>
      </div>
      <div className="flex items-center gap-5 px-4 pt-5 pb-3">
        <div>
          {/* <div className="w-20 select select-simple">
        <Listbox
          value={months[getMonth(date)]}
          onChange={(value) => changeMonth(months.indexOf(value))}
        >
          <Listbox.Button>{months[getMonth(date)]}</Listbox.Button>
          <Listbox.Options className="max-h-[200px] overflow-y-auto text-primary">
            {months.map((option) => (
              <Listbox.Option key={option} value={option}>
                {option}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Listbox>
      </div> */}
          <span className="mr-2 text-2xl font-bold react-datepicker__current-month text-primary">
            {monthDate.toLocaleString('en-US', {
              month: 'long',
            })}
          </span>

          <div className="select select-simple">
            <Listbox value={getYear(date)} onChange={(value) => changeYear(Number(value))}>
              <Listbox.Button className="!h-auto !not-sr-only !p-0 font-bold text-2xl">
                {getYear(date)}
              </Listbox.Button>
              <Listbox.Options className="max-h-[200px] overflow-y-auto text-primary">
                {years.map((option) => (
                  <Listbox.Option key={option} value={option}>
                    {option}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Listbox>
          </div>
        </div>
        <div className="ml-auto">
          <Button
            size="sm"
            iconOnly={<ChevronLeftIcon className="!w-4" />}
            onClick={decreaseMonth}
            disabled={prevMonthButtonDisabled}
            css="unstyled"
          />
          <Button
            size="sm"
            iconOnly={<ChevronRightIcon className="!w-4" />}
            onClick={increaseMonth}
            disabled={nextMonthButtonDisabled}
            css="unstyled"
          />
        </div>
      </div>
    </div>
  );
};
