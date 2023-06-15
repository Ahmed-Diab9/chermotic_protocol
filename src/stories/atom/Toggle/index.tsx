import { useState } from "react";
import { Switch } from "@headlessui/react";
import "./style.css";

interface ToggleProps {
  label?: string;
  size?: "xs" | "sm" | "base" | "lg";
  fontSize?: string;
  disabled?: boolean;
  onClick?: () => unknown;
}

export const Toggle = (props: ToggleProps) => {
  const { label, size = "base", fontSize = "base", disabled = false } = props;
  const [enabled, setEnabled] = useState(false);

  return (
    <Switch.Group>
      <div className="flex items-center gap-[6px]">
        {label && (
          <Switch.Label className={`text-${fontSize}`}>{label}</Switch.Label>
        )}
        <Switch
          checked={enabled}
          onChange={setEnabled}
          disabled={disabled}
          className={`toggle toggle-${size}`}
        ></Switch>
      </div>
    </Switch.Group>
  );
};
