import { MouseEventHandler } from "react";
import { Button } from "../Button";
import { XMarkIcon } from "@heroicons/react/20/solid";
import "./style.css";

interface DialogCloseButtonProps {
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export const DialogCloseButton = (props: DialogCloseButtonProps) => {
  return (
    <Button
      iconOnly={<XMarkIcon className="!h-5 text-black/30" />}
      css="noline"
      className="absolute top-2 right-2"
    />
  );
};
