import React, { useEffect, useState } from 'react';
import { ChevronDoubleDownIcon } from '@heroicons/react/24/outline';
import './style.css';

interface ScrollAniProps {
  disabled?: boolean;
}

export const ScrollAni: React.FC<ScrollAniProps> = (props: ScrollAniProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`scroll-ani transition-opacity ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <ChevronDoubleDownIcon className="w-4 animate-bounce" />
    </div>
  );
};
