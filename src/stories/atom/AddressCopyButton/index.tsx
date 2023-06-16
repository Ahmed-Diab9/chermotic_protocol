import { MouseEventHandler } from "react";
import { Button } from "../Button";
import { Square2StackIcon } from "@heroicons/react/24/outline";

interface AddressCopyButtonProps {
  address?: string;
  disabled?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

export const AddressCopyButton = (props: AddressCopyButtonProps) => {
  const { address = "Create Account", onClick } = props;

  return (
    <div className="flex items-center justify-between flex-auto bg-white border border-collapse rounded-full max-w-[220px]">
      <p className="px-4">{address}</p>
      <Button
        label="Copy Address"
        css="circle"
        size="lg"
        className="m-[-1px]"
        iconOnly={<Square2StackIcon />}
        onClick={onClick}
      />
    </div>
  );
};
