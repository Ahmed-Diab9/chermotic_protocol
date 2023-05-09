import { useState } from "react";

type ButtonRadioOption = {
  label: string;
  value: string;
};

type ButtonRadioProps = {
  options: ButtonRadioOption[];
  onChange: (value: string) => void;
  defaultSelected?: string;
  size?: "xs" | "sm" | "base" | "lg";
};

export const ButtonRadio = ({
  options,
  onChange,
  defaultSelected = undefined,
  size = "base",
}: ButtonRadioProps) => {
  const [selected, setSelected] = useState<string>(
    defaultSelected ?? options[0].value
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
          className={`px-4 py-2 border rounded btn-${size} ${
            selected === option.value ? "border-active text-active" : ""
          }`}
          onClick={() => handleOptionClick(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
