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

export const Toggle = ({
  label,
  size = "base",
  fontSize = "base",
  ...props
}: ToggleProps) => {
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
          className={`toggle toggle-${size} ${
            enabled
              ? "bg-active dark:bg-black"
              : "bg-active/60 dark:bg-black/60"
          } relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-white focus-visible:ring-opacity-75`}
        >
          <span
            aria-hidden="true"
            className="inline-block transition duration-200 ease-in-out transform bg-white rounded-full pointer-events-none"
          />
        </Switch>
      </div>
    </Switch.Group>
  );
};
