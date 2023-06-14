import { ChangeEvent, useEffect, useRef } from "react";
import { Avatar } from "../Avatar";
import "./style.css";
import { isValid } from "~/utils/valid";

interface InputProps {
  label?: string;
  value?: string | number;
  placeholder?: string;
  assetSrc?: string;
  unit?: string;
  type?: string;
  className?: string;
  size?: "xs" | "sm" | "base" | "lg";
  css?: "default" | "active";
  align?: "center" | "left" | "right";
  disabled?: boolean;
  onClick?: () => unknown;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => unknown;
  onClickAway?: () => unknown;
}

export const Input = (props: InputProps) => {
  const {
    placeholder,
    assetSrc,
    unit,
    type = "number",
    className,
    size = "base",
    css = "default",
    align = "right",
    value,
    onChange,
    onClickAway,
  } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isValid(onClickAway)) {
      return;
    }
    const handleClickAway = (event: MouseEvent) => {
      const element = event.target;
      if (element instanceof Node) {
        const isContained = inputRef.current?.contains(element);
        if (!isContained) {
          onClickAway?.();
        }
      }
    };
    document.addEventListener("mousedown", handleClickAway);

    return () => {
      document.removeEventListener("mousedown", handleClickAway);
    };
  }, [onClickAway, inputRef, value]);

  return (
    <div
      className={`inline-flex gap-1 items-center input input-${size} input-${css} ${className}`}
    >
      {assetSrc ? <Avatar src={assetSrc} size="sm" /> : null}
      <input
        ref={inputRef}
        type={type}
        className={`text-${align}`}
        value={typeof value === "number" ? value.toString() : value}
        placeholder={placeholder}
        onChange={(event) => {
          event.preventDefault();
          onChange && onChange(event);
        }}
      />
      {unit ? <span className="text-black/30">{unit}</span> : null}
    </div>
  );
};
