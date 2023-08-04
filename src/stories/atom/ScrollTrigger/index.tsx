import { ChevronDoubleDownIcon } from '@heroicons/react/24/outline';
import React from 'react';
import './style.css';

interface ScrollTriggerProps {
  isVisible?: boolean;
  hasOpacity?: boolean;
}

export const ScrollTrigger: React.FC<ScrollTriggerProps> = (props: ScrollTriggerProps) => {
  const { isVisible, hasOpacity } = props;

  return (
    <span
      className={`scroll-trigger ${isVisible ? 'visible' : 'invisible'} transition-opacity ${
        hasOpacity ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <ChevronDoubleDownIcon className="w-4 animate-bounce" />
    </span>
  );
};
