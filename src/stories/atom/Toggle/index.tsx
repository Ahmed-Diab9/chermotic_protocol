import { useState } from "react";
import { Switch } from "@headlessui/react";

interface ToggleProps {
  label: string;
  size?: "sm" | "base" | "lg";
  disabled?: boolean;
  onClick?: () => unknown;
}

export const Toggle = ({ label, size = "base", ...props }: ToggleProps) => {
  const [enabled, setEnabled] = useState(false);

  return (
    <>
      <Switch
        checked={enabled}
        onChange={setEnabled}
        className={`toggle ${
          enabled ? "bg-active dark:bg-black" : "bg-active/60 dark:bg-black/60"
        } ${size === "base" ? "h-[24px] w-[48px]" : "h-[32px] w-[64px]"}
          relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-white focus-visible:ring-opacity-75`}
      >
        <span className="sr-only">{label}</span>
        <span
          aria-hidden="true"
          className={`${
            enabled
              ? size === "base"
                ? "translate-x-6"
                : "translate-x-8"
              : "translate-x-0"
          } ${size === "base" ? "h-[20px] w-[20px]" : "h-[28px] w-[28px]"}
            pointer-events-none inline-block transform rounded-full bg-white transition duration-200 ease-in-out`}
        />
      </Switch>
    </>
  );
};
