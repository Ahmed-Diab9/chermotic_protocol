import { useState, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export interface CalendarProps {}

export function Calendar(props: CalendarProps) {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);

  const onChange = (dates: any) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const ExampleCustomInput = forwardRef<
    HTMLButtonElement,
    { value?: string; onClick?: () => void }
  >(({ value, onClick }, ref) => (
    <button className="example-custom-input" onClick={onClick} ref={ref}>
      {value}
    </button>
  ));

  return (
    <DatePicker
      selected={startDate}
      onChange={onChange}
      // onChange={(date) => setStartDate(date)}
      // onChange={(date: Date | null) => setStartDate(date)}
      startDate={startDate}
      endDate={endDate}
      selectsRange
      popperPlacement="bottom-end"
      // customInput={<ExampleCustomInput />}
      customInput={<DatePickerInput />}
    />
  );
}

export interface DatePickerInputProps {
  value?: string;
  ref?: string;
  onClick?: () => void;
}

const DatePickerInput = (props: DatePickerInputProps) => {
  const { value, onClick, ref } = props;

  return (
    <button className="example-custom-input" onClick={onClick} ref={ref}>
      {value}
    </button>
  );
};
