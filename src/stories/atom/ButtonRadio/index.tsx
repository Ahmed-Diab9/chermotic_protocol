import { useState } from 'react';

type ButtonRadioOption = {
  label: string;
  value: string;
};

type ButtonRadioProps = {
  options: ButtonRadioOption[];
  onChange: (value: string) => void;
  defaultSelected?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg';
};

export const ButtonRadio = (props: ButtonRadioProps) => {
  const { options, onChange, defaultSelected = undefined, size = 'base' } = props;
  const [selected, setSelected] = useState<string | undefined>(
    // defaultSelected ?? options[0].value
    defaultSelected ?? undefined
  );
  const handleOptionClick = (value: string) => {
    setSelected(value);
    onChange(value);
  };

  return (
    <div className="flex space-x-2">
      {options.map((option) => (
        <button
          key={option.value}
          className={`px-4 py-2 border rounded text-black dark:text-white btn-${size} ${
            selected === option.value ? 'border-black dark:border-white' : ''
          }`}
          onClick={() => handleOptionClick(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
