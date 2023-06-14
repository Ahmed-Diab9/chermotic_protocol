import { ChevronDoubleLeftIcon } from "@heroicons/react/20/solid";
import { ChevronDoubleRightIcon } from "@heroicons/react/20/solid";

interface CurvedButtonProps {
  direction: "right" | "left";
  position: "right" | "left";
  className?: string;
  disabled?: boolean;
  // onClick?: MouseEventHandler<HTMLCurvedButtonElement>;
}

export const CurvedButton = (props: CurvedButtonProps) => {
  const {
    // onClick,
    direction,
    position,
    className,
  } = props;

  return (
    <button
      className={`relative border-none bg-white w-[50px] h-[50px] rounded-full text-black/30 hover:text-black/50 ${
        position === "right" ? "translate-x-[50%]" : "translate-x-[-50%]"
      } ${className}`}
    >
      <div className="inline-flex items-center justify-center w-full h-full">
        <CurvedLine direction={direction} position={position} />
        {direction === "right" ? (
          <ChevronDoubleRightIcon
            className={`w-4 ${
              position === direction ? "mr-[-10px]" : "mr-[-4px]"
            }`}
          />
        ) : (
          <ChevronDoubleLeftIcon
            className={`w-4 ${
              position === direction ? "ml-[-10px]" : "ml-[-4px]"
            }`}
          />
        )}
      </div>
    </button>
  );
};

interface CurvedLineProps {
  direction: "right" | "left";
  position: "right" | "left";
  className?: string;
}

const CurvedLine = (props: CurvedLineProps) => {
  const { direction, position } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="21"
      height="53"
      fill="none"
      viewBox="0 0 21 53"
      className={`absolute top-[-2px] z-0 ${
        direction === "right"
          ? position === direction
            ? "right-[4px]"
            : "right-[5px]"
          : position === direction
          ? "rotate-180 left-[4px]"
          : "rotate-180 left-[5px]"
      }`}
    >
      <path
        fill="#EEE"
        fill-rule="evenodd"
        d="M0 53h1c0-3.816 3.234-6.983 7.184-8.497C15.664 41.638 21 34.92 21 27c0-7.919-5.335-14.638-12.816-17.503C4.234 7.983 1 4.817 1 1V0H0v1c0 4.418 3.7 7.85 7.827 9.43C14.983 13.173 20 19.56 20 27c0 7.441-5.017 13.828-12.173 16.57C3.7 45.15 0 48.58 0 53Z"
        clip-rule="evenodd"
      />
    </svg>
  );
};
