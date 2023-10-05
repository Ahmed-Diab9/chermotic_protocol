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
        <span className={`wrapper-img avatar-${size} ${className} `}>
          {src ? (
            <img src={src} alt="" className="object-cover w-full h-full" />
          ) : svg ? (
            <span className="inline-block w-[68%] h-[68%]">{svg}</span>
          ) : (
            <span className="w-full h-full bg-[#D9D9D9] dark:bg-[#696974]" />
          )}
          {/* {svg && } */}
        </span>
        {label && <p className={`font-${fontWeight} text-${fontSize}`}>{label}</p>}
      </span>
    </span>
  );
};
