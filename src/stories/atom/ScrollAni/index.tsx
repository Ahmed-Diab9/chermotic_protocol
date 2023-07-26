import { ChevronDoubleDownIcon } from '@heroicons/react/24/outline';
import React from 'react';
import './style.css';

interface ScrollAniProps {
  isVisible?: boolean;
}

export const ScrollAni: React.FC<ScrollAniProps> = (props: ScrollAniProps) => {
  const { isVisible } = props;

  return (
    <div className={`scroll-ani transition-opacity ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <ChevronDoubleDownIcon className="w-4 animate-bounce" />
    </div>
  );
};
