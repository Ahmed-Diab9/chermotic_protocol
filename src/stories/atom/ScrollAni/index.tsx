import { ChevronDoubleDownIcon } from '@heroicons/react/24/outline';
import React from 'react';
import './style.css';

interface ScrollAniProps {
  isVisible?: boolean;
  hasOpacity?: boolean;
}

export const ScrollAni: React.FC<ScrollAniProps> = (props: ScrollAniProps) => {
  const { isVisible, hasOpacity } = props;

  return (
    <span
      className={`scroll-ani ${isVisible ? 'visible' : 'invisible'} transition-opacity ${
        hasOpacity ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <ChevronDoubleDownIcon className="w-4 animate-bounce" />
    </span>
  );
};
