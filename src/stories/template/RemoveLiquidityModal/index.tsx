import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "../../atom/Button";
import { ModalCloseButton } from "~/stories/atom/ModalCloseButton";
import { Avatar } from "~/stories/atom/Avatar";
import { Slider } from "~/stories/atom/Slider";
import { OptionInput } from "~/stories/atom/OptionInput";
import { Thumbnail } from "~/stories/atom/Thumbnail";
import "../Modal/style.css";

interface RemoveLiquidityModalProps {
  onClick?: () => void;
}

export const RemoveLiquidityModal = ({
  ...props
}: RemoveLiquidityModalProps) => {
  let [isOpen, setIsOpen] = useState(true);

  return (
    <Dialog
      className="modal w-full max-w-[500px]"
      open={isOpen}
      onClose={() => setIsOpen(false)}
    >
      <Dialog.Panel>
        <Dialog.Title className="modal-title">
          Remove Liquidity
          <ModalCloseButton onClick={() => setIsOpen(false)} />
        </Dialog.Title>
        <div className="w-[100px] mx-auto border-b border-2 border-black"></div>
        <Dialog.Description className="gap-10 modal-content">
          {/* liquidity info */}
          <article className="w-full">
            {/* inner box */}
            <div className="flex items-center w-full gap-3 px-4 py-3 border rounded-2xl bg-grayL/20">
              <Thumbnail size="lg" className="rounded" />
              <div>
                <Avatar label="USDC" size="xs" gap="1" />
                <p className="mt-2 text-black/30">ETH/USD +0.03%</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-black/30">Qty</p>
                <p className="mt-2 text-lg">2504.34</p>
              </div>
            </div>

            {/* list */}
            <div className="flex flex-col gap-2 mt-5">
              <div className="flex justify-between">
                <p className="text-black/30">My Liquidity Value</p>
                <p>2,850.24 USDC</p>
              </div>
              <div className="flex justify-between">
                <p className="text-black/30">Removable Liquidity</p>
                <p>
                  756.36 USDC
                  <span className="ml-1 text-black/30">(87.5%)</span>
                </p>
              </div>
            </div>
          </article>

          {/* input - range */}
          <article>
            <div className="flex justify-between">
              <p className="font-semibold">Utilized</p>
              <p className="font-semibold">Removable</p>
            </div>
            <div className="mt-4 h-9">
              <Slider value={50} />
            </div>
          </article>

          {/* input - number */}
          <article className="flex gap-4">
            <p className="font-semibold">
              Remove Liquidity Tokens
              <br />
              (Chroma)
            </p>
            <div className="max-w-[220px]">
              <OptionInput className="w-full" />
              <p className="mt-4 text-xs text-black/30">
                Please set additional values to apply to the basic formula in
                Borrow Fee. Calculated based on open Interest and stop
                profit/Loss rate.
              </p>
            </div>
          </article>
        </Dialog.Description>
        <div className="modal-button">
          <Button label="Remove" size="xl" className="text-lg" css="active" />
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};
