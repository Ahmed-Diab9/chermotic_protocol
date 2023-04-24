import { useState } from "react";
import { Switch } from "@headlessui/react";

interface ToggleProps {
  active?: boolean;
  backgroundColor?: string;
  size?: "sm" | "md" | "lg";
  label: string;
  onClick?: () => void;
}

export const Toggle = ({
  active = false,
  size = "md",
  backgroundColor,
  label,
  ...props
}: ToggleProps) => {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="">
      <Switch
        checked={enabled}
        onChange={setEnabled}
        className={`${
          enabled ? "bg-active dark:bg-black" : "bg-active/60 dark:bg-black/60"
        }
          relative inline-flex h-[38px] w-[74px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
      >
        <span className="sr-only">Use setting</span>
        <span
          aria-hidden="true"
          className={`${enabled ? "translate-x-9" : "translate-x-0"}
            pointer-events-none inline-block h-[34px] w-[34px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
        />
      </Switch>
    </div>
  );
};
