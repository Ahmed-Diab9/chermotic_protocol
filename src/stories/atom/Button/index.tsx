import { MouseEventHandler } from 'react';
import './style.css';

export interface ButtonProps {
  label?: string;
  css?:
    | 'default'
    | 'light'
    | 'active'
    | 'line'
    | 'circle'
    | 'square'
    | 'unstyled'
    | 'underlined'
    | 'translucent'
    | 'long'
    | 'short'
    | 'chrm'
    | 'chrm-hover';
  disabled?: boolean;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  align?: 'center' | 'left' | 'right';
  to?: string;
  href?: string;
  gap?: string;
  className?: string;
  iconLeft?: any;
  iconOnly?: any;
  iconRight?: any;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export const Button = (props: ButtonProps) => {
  const {
    label,
    css = 'default',
    disabled = false,
    size = 'base',
    align = 'center',
    to,
    href,
    gap = '2',
    className = '',
    iconLeft,
    iconOnly,
    iconRight,
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
