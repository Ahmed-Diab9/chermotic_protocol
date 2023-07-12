import './style.css';
import { Switch } from '@headlessui/react';

interface ToggleProps {
  label?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg';
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  disabled?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange: (checked: boolean) => void;
}

export const Toggle = (props: ToggleProps) => {
  const {
    label,
    size = 'base',
    fontSize = 'base',
    disabled = false,
    checked,
    defaultChecked = false,
    onChange,
  } = props;

  return (
    <Switch.Group>
      <div className="flex items-center gap-[6px]">
        {label && <Switch.Label className={`text-${fontSize}`}>{label}</Switch.Label>}
        <Switch
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={onChange}
          disabled={disabled}
          className={`toggle toggle-${size}`}
        ></Switch>
      </div>
    </Switch.Group>
  );
};
