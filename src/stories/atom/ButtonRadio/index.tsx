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
    // defaultSelected ?? options[0].value
    // 초기값이 설정되지 않은 경우, 아무것도 선택되어있지 않도록
    defaultSelected ?? null
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
