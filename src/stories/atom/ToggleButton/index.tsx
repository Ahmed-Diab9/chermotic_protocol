import React, { useState } from "react";
import "../Button/style.css";

interface ToggleButtonProps {
  label?: string;
  size?: "xs" | "sm" | "base" | "lg";
  className?: string;
  onToggle: (checked: boolean) => void;
}

export const ToggleButton = ({
  label,
  onToggle,
  size = "base",
  className,
  ...props
}: ToggleButtonProps) => {
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
      onClick={handleToggle}
      {...props}
    >
      {label}
      {isChecked ? " ON" : " OFF"}
    </button>
  );
};
