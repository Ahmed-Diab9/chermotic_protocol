import React, { ReactNode } from 'react';
import './style.css';

interface AvatarProps {
  label?: string;
  active?: boolean;
  backgroundColor?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  fontWeight?: 'lighter' | 'normal' | 'medium' | 'semibold' | 'bold';
  gap?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => unknown;
  src?: string;
  svg?: ReactNode;
}

export const Avatar = (props: AvatarProps) => {
  const {
    className = '',
    size = 'base',
    gap = '2',
    src,
    svg,
    label,
    fontSize = 'base',
    fontWeight = 'semibold',
  } = props;

  return (
    <span className="avatar">
      <span className={`flex items-center gap-${gap}`}>
        <span
          className={`avatar-${size} ${className} bg-white rounded-full overflow-hidden shrink-0 flex items-center justify-center`}
        >
          {src && <img src={src} alt="" className="object-cover w-full h-full" />}
          {svg && <span className="inline-block w-[68%] h-[68%]">{svg}</span>}
        </span>
        {label && <p className={`font-${fontWeight} text-${fontSize}`}>{label}</p>}
      </span>
    </span>
  );
};
