import React, { useState } from "react";
import "../Button/style.css";

interface ToggleButtonProps {
  label?: string;
  size?: "xs" | "sm" | "base" | "lg";
  className?: string;
  disabled?: boolean;
  onToggle: (checked: boolean) => void;
}

export const ToggleButton = (props: ToggleButtonProps) => {
  const { label, onToggle, size = "base", className, disabled = false } = props;
  const [isChecked, setIsChecked] = useState(false);
  const handleToggle = () => {
    setIsChecked(!isChecked);
    onToggle(!isChecked);
  };

  return (
    <button
      type="button"
      className={`btn btn-${size} ${className} toggle-${
        isChecked ? "on" : "off"
      }`}
      disabled={disabled}
      onClick={handleToggle}
      {...props}
    >
      {label}
      {isChecked ? " ON" : " OFF"}
    </button>
  );
};
