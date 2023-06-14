import { MouseEventHandler } from "react";
import { ChevronDoubleDownIcon } from "@heroicons/react/20/solid";

interface ScrollAniProps {
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export const ScrollAni = (props: ScrollAniProps) => {
  // const { onClick } = props;

  return <ChevronDoubleDownIcon className="w-4 animate-bounce scroll-ani" />;
};
