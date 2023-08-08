import { ChevronDoubleUpIcon } from '@heroicons/react/24/outline';
import { ChevronDoubleDownIcon } from '@heroicons/react/24/outline';
import { ChevronDoubleRightIcon } from '@heroicons/react/24/outline';
import { ChevronDoubleLeftIcon } from '@heroicons/react/24/outline';

interface PopoverArrowProps {
  direction: 'top' | 'bottom' | 'left' | 'right';
  position: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  disabled?: boolean;
  onClick?: () => unknown;
}

export const PopoverArrow = (props: PopoverArrowProps) => {
  const { onClick, direction = 'top', position = 'top', className = '' } = props;

  return (
    <span
      className={`inline-block relative border-none w-[53px] h-[53px] rounded-full text-black3 hover:text-black2 dark:text-white3 dark:hover:text-white2 overflow-hidden cursor-pointer ${className}`}
      onClick={onClick}
    >
      <span className="inline-flex items-center justify-center w-full h-full">
        <PopoverLineBg direction={direction} position={position} />
        {direction === 'top' ? (
          <ChevronDoubleUpIcon className={`w-4 relative `} />
        ) : direction === 'bottom' ? (
          <ChevronDoubleDownIcon className={`w-4 relative mt-[2px]`} />
        ) : direction === 'left' ? (
          <ChevronDoubleLeftIcon className={`w-4 relative `} />
        ) : direction === 'right' ? (
          <ChevronDoubleRightIcon className={`w-4 relative `} />
        ) : null}
      </span>
    </span>
  );
};

interface PopoverLineBgProps {
  direction: 'right' | 'left' | 'top' | 'bottom';
  position: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const PopoverLineBg = (props: PopoverLineBgProps) => {
  const { position } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="55"
      height="53"
      fill="none"
      viewBox="0 0 55 53"
      className={`absolute top-0 ${
        position === 'top'
          ? '-rotate-90'
          : position === 'bottom'
          ? 'rotate-90'
          : position === 'left'
          ? 'rotate-180'
          : position === 'right'
          ? ''
          : null
      }`}
    >
      <path
        fillRule="evenodd"
        d="M17 53h1c0-3.816 3.234-6.983 7.184-8.497C32.665 41.638 38 34.92 38 27c0-7.919-5.335-14.638-12.816-17.503C21.235 7.983 18 4.817 18 1V0h-1v1c0 4.418 3.7 7.85 7.827 9.43C31.983 13.172 37 19.56 37 27c0 7.441-5.017 13.828-12.173 16.57C20.7 45.15 17 48.581 17 53Z"
        clipRule="evenodd"
        className="translate-x-1 fill-light1 dark:fill-dark1"
      />
      <path
        fillRule="evenodd"
        d="M17 0H0v53h17c0-4.418 3.7-7.85 7.827-9.43C31.983 40.828 37 34.44 37 27c0-7.441-5.017-13.828-12.173-16.57C20.7 8.85 17 5.419 17 1V0Z"
        clipRule="evenodd"
        className="translate-x-1 fill-white dark:fill-black1"
      />
    </svg>
  );
};
