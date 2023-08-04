import { MouseEventHandler } from 'react';
import './style.css';

interface ButtonProps {
  label?: string;
  css?: 'default' | 'active' | 'gray' | 'unstyled' | 'circle';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  align?: 'center' | 'left' | 'right';
  to?: string;
  href?: string;
  gap?: string;
  className?: string;
  iconLeft?: any;
  iconOnly?: any;
  iconRight?: any;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export const Button = (props: ButtonProps) => {
  const {
    label,
    css = 'default',
    size = 'base',
    align = 'center',
    to,
    href,
    gap = '2',
    className = '',
    iconLeft,
    iconOnly,
    iconRight,
    disabled = false,
    onClick,
  } = props;
  const btnIconOnly = iconOnly ? 'btn-icon-only' : '';

  return (
    <>
      <button
        type="button"
        className={`btn btn-${size} btn-${css} ${className} ${btnIconOnly}`}
        disabled={disabled}
        onClick={
          href
            ? () => window.open(href, '_blank')
            : to
            ? () => (window.location.href = to)
            : onClick
        }
      >
        <span className={`flex items-center gap-${gap} justify-${align}`}>
          {iconLeft !== undefined ? iconLeft : null}
          {iconOnly !== undefined ? iconOnly : label}
          {iconRight !== undefined ? iconRight : null}
        </span>
      </button>
    </>
  );
};
