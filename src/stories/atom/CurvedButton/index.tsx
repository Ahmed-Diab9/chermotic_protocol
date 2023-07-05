import { ChevronDoubleLeftIcon } from '@heroicons/react/24/outline';
import { ChevronDoubleRightIcon } from '@heroicons/react/24/outline';

interface CurvedButtonProps {
  direction: 'right' | 'left';
  position: 'right' | 'left';
  className?: string;
  disabled?: boolean;
  onClick?: () => unknown;
}

export const CurvedButton = (props: CurvedButtonProps) => {
  const { onClick, direction, position, className } = props;

  return (
    <button
      className={`relative border-none w-[53px] h-[53px] rounded-full text-black/30 hover:text-black/50 overflow-hidden ${
        position === 'right' ? 'translate-x-[50%]' : 'translate-x-[-50%]'
      } ${className}`}
      onClick={onClick}
    >
      <div className="inline-flex items-center justify-center w-full h-full">
        <CurvedLineBg direction={direction} position={position} />
        {direction === 'right' ? (
          <ChevronDoubleRightIcon
            className={`w-4 relative ${position === direction ? 'mr-[-12px]' : 'mr-[-4px]'}`}
          />
        ) : (
          <ChevronDoubleLeftIcon
            className={`w-4 relative ${position === direction ? 'ml-[-12px]' : 'ml-[-4px]'}`}
          />
        )}
      </div>
    </button>
  );
};

interface CurvedLineBgProps {
  direction: 'right' | 'left';
  position: 'right' | 'left';
  className?: string;
}

const CurvedLineBg = (props: CurvedLineBgProps) => {
  const { direction, position } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="55"
      height="53"
      fill="none"
      viewBox="0 0 55 53"
      className={`absolute top-0 ${
        direction === 'right'
          ? position === direction
            ? 'mr-[-21px]'
            : 'mr-[-19px]'
          : position === direction
          ? 'rotate-180 ml-[-21px]'
          : 'rotate-180 ml-[-19px]'
      }`}
    >
      <path
        fill="#EEE"
        fillRule="evenodd"
        d="M17 53h1c0-3.816 3.234-6.983 7.184-8.497C32.665 41.638 38 34.92 38 27c0-7.919-5.335-14.638-12.816-17.503C21.235 7.983 18 4.817 18 1V0h-1v1c0 4.418 3.7 7.85 7.827 9.43C31.983 13.172 37 19.56 37 27c0 7.441-5.017 13.828-12.173 16.57C20.7 45.15 17 48.581 17 53Z"
        clipRule="evenodd"
      />
      <path
        fill={position === direction ? '#FFF' : '#FBFBFB'}
        fillRule="evenodd"
        d="M17 0H0v53h17c0-4.418 3.7-7.85 7.827-9.43C31.983 40.828 37 34.44 37 27c0-7.441-5.017-13.828-12.173-16.57C20.7 8.85 17 5.419 17 1V0Z"
        clipRule="evenodd"
      />
    </svg>
  );
};
