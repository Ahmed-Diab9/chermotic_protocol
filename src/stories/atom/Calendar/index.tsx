import 'react-datepicker/dist/react-datepicker.css';
import '~/stories/atom/Select/style.css';
import './style.css';

import { getMonth, getYear, isSameDay, subMonths, subWeeks, subYears } from 'date-fns';
import { isNil, isNotNil, range } from 'ramda';
import { Dispatch, SetStateAction, forwardRef, useEffect, useMemo, useState } from 'react';
import DatePicker, { ReactDatePickerCustomHeaderProps } from 'react-datepicker';

import { Listbox } from '@headlessui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Button } from '~/stories/atom/Button';

type NullableDate = Date | null;
type Dates = [NullableDate, NullableDate];

export interface CalendarProps {
  startDate: NullableDate;
  setStartDate: ((date: NullableDate) => void) | Dispatch<SetStateAction<NullableDate>>;
  endDate: NullableDate;
  setEndDate: ((date: NullableDate) => void) | Dispatch<SetStateAction<NullableDate>>;
}

export function Calendar({ startDate, endDate, setStartDate, setEndDate }: CalendarProps) {
  const [tempDate, setTempDate] = useState<[Date, Date]>([
    startDate || new Date(),
    endDate || new Date(),
  ]);

  const onChange = ([start, end]: Dates) => {
    setStartDate(start);
    setEndDate(end);

    if (isNotNil(start) && isNotNil(end)) {
      setTempDate([start, end]);
    }
  };

  const onClose = () => {
    if (isNil(startDate) || isNil(endDate)) {
      const [start, end] = tempDate;
      setStartDate(start);
      setEndDate(end);
    }
  };

  const today = useMemo(() => new Date(), []);

  return (
    <DatePicker
      dateFormat="yyyy/MM/dd"
      onChange={onChange}
      startDate={startDate}
      endDate={endDate}
      selectsRange
      popperPlacement="bottom-end"
      customInput={<DatePickerInput />}
      renderCustomHeader={DatePickerHeader([startDate, endDate], onChange)}
      maxDate={today}
      onCalendarClose={onClose}
      calendarClassName="Calendar"
      disabledKeyboardNavigation
    />
  );
}

const DatePickerInput = forwardRef<HTMLButtonElement, { value?: string; onClick?: () => unknown }>(
  (props, ref) => {
    const { value, onClick } = props;
    return (
      <button className="example-custom-input" onClick={onClick} ref={ref}>
        {value}
      </button>
    );
  }
);

const DatePickerHeader =
  (dates: Dates, onChange: (dates: Dates) => void): React.FC<ReactDatePickerCustomHeaderProps> =>
  ({
    date,
    monthDate,
    changeMonth,
    changeYear,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }) => {
    const YEARS_COUNT = 2;

    const thisYear = new Date().getFullYear();
    const years = range(thisYear - YEARS_COUNT + 1, thisYear + 1).reverse();

    return (
      <div>
        <QuickButtons
          onChange={onChange}
          dates={dates}
          changeMonth={changeMonth}
          changeYear={changeYear}
        />
        <div className="flex items-center gap-0 px-5 pt-5 pb-4">
          <div>
            <span className="mr-2 !text-2xl font-bold react-datepicker__current-month !text-primary">
              {monthDate.toLocaleString('en-US', {
                month: 'long',
              })}
            </span>

            <div className="select select-simple">
              <Listbox value={getYear(date)} onChange={changeYear}>
                <Listbox.Button className="!h-auto !not-sr-only !p-0 font-bold text-2xl">
                  {getYear(date)}
                </Listbox.Button>
                <Listbox.Options className="max-h-[200px] min-w-[80px] overflow-y-auto text-primary">
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

const QuickButtons = ({
  onChange,
  dates,
  changeYear,
  changeMonth,
}: {
  onChange: (dates: Dates) => void;
  dates: Dates;
  changeYear: (year: number) => void;
  changeMonth: (month: number) => void;
}) => {
  const buttons = [
    { label: 'A Week', start: subWeeks(new Date(), 1) },
    { label: 'A Month', start: subMonths(new Date(), 1) },
    { label: '3 Month', start: subMonths(new Date(), 3) },
    { label: '6 Month', start: subMonths(new Date(), 6) },
    { label: '1 Year', start: subYears(new Date(), 1) },
    { label: 'All time', start: new Date(0) },
  ];

  const [selectedButtonIndex, setSelectedButtonIndex] = useState(-1);

  useEffect(() => {
    const [start, end] = dates;
    const buttonIndex = buttons.findIndex((button) => isSameDay(button.start, start || new Date()));
    if (buttonIndex !== -1 && isSameDay(new Date(), end || new Date())) {
      setSelectedButtonIndex(buttonIndex);
    }
  }, []);

  const handleButtonClick = (index: number) => () => {
    setSelectedButtonIndex(index);

    const start = buttons[index].start;
    const end = new Date();

    onChange([start, end]);
    changeYear(getYear(start));
    changeMonth(getMonth(start));
  };

  return (
    <div className="flex flex-wrap">
      {buttons.map(({ label }, index) => (
        <button
          key={index}
          className={`btn-quick ${selectedButtonIndex === index ? 'selected' : ''}`}
          onClick={handleButtonClick(index)}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
