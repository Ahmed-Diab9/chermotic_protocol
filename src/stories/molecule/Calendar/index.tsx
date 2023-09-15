import { useState, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getYear, getMonth } from 'date-fns';
import enGB from 'date-fns/locale/en-GB';

import { Button } from '~/stories/atom/Button';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

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
  changeYear: (year: number) => void;
  changeMonth: (month: number) => void;
  decreaseMonth: () => void;
  increaseMonth: () => void;
  prevMonthButtonDisabled: boolean;
  nextMonthButtonDisabled: boolean;
}> = ({
  date,
  changeYear,
  changeMonth,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
}) => {
  const years: number[] = [];
  for (let year = 1990; year <= getYear(new Date()); year++) {
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
    <div style={{ margin: 10, display: 'flex', justifyContent: 'center' }}>
      <select
        title="month"
        value={months[getMonth(date)]}
        onChange={({ target: { value } }) => changeMonth(months.indexOf(value))}
      >
        {months.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <select
        title="year"
        value={getYear(date)}
        onChange={({ target: { value } }) => changeYear(Number(value))}
      >
        {years.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <div className="ml-auto">
        <Button
          iconOnly={<ChevronLeftIcon />}
          onClick={decreaseMonth}
          disabled={prevMonthButtonDisabled}
          css="unstyled"
        />
        <Button
          iconOnly={<ChevronRightIcon />}
          onClick={increaseMonth}
          disabled={nextMonthButtonDisabled}
          css="unstyled"
        />
      </div>
    </div>
  );
};
