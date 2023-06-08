import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "../../atom/Button";
import { ModalCloseButton } from "~/stories/atom/ModalCloseButton";
import { Avatar } from "~/stories/atom/Avatar";
import { Progress } from "~/stories/atom/Progress";
import { Input } from "~/stories/atom/Input";
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
    <Dialog className="" open={isOpen} onClose={() => setIsOpen(false)}>
      <div className="fixed inset-0 bg-white/80" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="modal bg-white w-full max-w-[500px]">
          <Dialog.Title className="modal-title">
            Remove Liquidity
            {/* Bin 개수가 여러개일 때 */}
            <span className="ml-2">(2)</span>
            <ModalCloseButton onClick={() => setIsOpen(false)} />
          </Dialog.Title>
          <div className="w-[100px] mx-auto border-b border-2 border-black"></div>
          <Dialog.Description className="gap-5 modal-content">
            {/* liquidity items */}
            <article className="flex flex-col gap-5 max-h-[calc(100vh-600px)] mx-[-20px] px-[20px] overflow-auto">
              <LiquidityItem
                token="USDC"
                name="ETH/USD +0.03%"
                qty={2640.68}
                utilizedValue={820.34}
                removableValue={1820.34}
              />
              <LiquidityItem
                token="USDC"
                name="ETH/USD +0.03%"
                qty={2500.03}
                utilizedValue={135.12}
                removableValue={2364.91}
              />
            </article>

            {/* info bottom */}
            <article className="flex flex-col gap-2 pb-5 border-b">
              {/* for single bin */}
              <div className="flex justify-between">
                <p className="text-black/30">My Liquidity Value</p>
                <p>2,850.24 USDC</p>
              </div>
              <div className="flex justify-between">
                <p className="text-black/30">Removable Liquidity</p>
                <p>
                  756.36 CLB
                  <span className="ml-1 text-black/30">(87.5%)</span>
                </p>
              </div>

              {/* for multiple bins */}
              <div className="flex justify-between">
                <p className="text-black/30">Total CLB</p>
                <p>2,850.24 CLB</p>
              </div>
              <div className="flex justify-between">
                <p className="text-black/30">Total Liquidity Value</p>
                <p>756.36 USDC</p>
              </div>
              <div className="flex justify-between">
                <p className="text-black/30">Removable Liquidity</p>
                <p>
                  756.36 CLB
                  <span className="ml-1 text-black/30">(87.5%)</span>
                </p>
              </div>
            </article>

            {/* input - number */}
            <article className="">
              <p className="font-semibold">Remove CLB Tokens</p>
              <div className="flex items-center justify-between gap-6 mt-3">
                <div className="flex gap-1">
                  <Button
                    className="flex-auto border-gray drop-shadow-md"
                    label="All"
                    size="sm"
                  />
                  <Button
                    className="flex-auto border-gray drop-shadow-md"
                    label="Removable"
                    size="sm"
                  />
                </div>
                <div className="max-w-[220px]">
                  <Input unit="CLB" />
                </div>
              </div>
              <p className="mt-2 text-right text-black/30">0.00 USDC</p>
              <p className="mt-4 text-xs text-black/30">
                Please set additional values to apply to the basic formula in
                Borrow Fee. Calculated based on open Interest and stop
                profit/Loss rate.
              </p>
            </article>
          </Dialog.Description>
          <div className="modal-button">
            <Button label="Remove" size="xl" className="text-lg" css="active" />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

interface LiquidityItemProps {
  token?: string;
  name?: string;
  qty?: number;
  utilizedValue: number;
  removableValue: number;
}

const LiquidityItem = (props: LiquidityItemProps) => {
  const { token = "USDC", name, qty, utilizedValue, removableValue } = props;
  const utilizedPercent = (utilizedValue / qty) * 100;
  const remoablePercent = (removableValue / qty) * 100;

  // 숫자에 천단위 쉼표 추가
  // 소수점 2자리 표기

  return (
    <div className="w-full px-4 py-3 border rounded-2xl bg-grayL/20">
      <div className="flex items-center gap-3 pb-4 mb-4 border-b">
        <Thumbnail size="lg" className="rounded" />
        <div>
          <Avatar label={token} size="xs" gap="1" />
          <p className="mt-2 text-black/30">{name}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-black/30">Qty</p>
          <p className="mt-2 text-lg">{qty}</p>
        </div>
      </div>
      <div className="text-sm">
        <div className="flex justify-between mb-2">
          <p className="font-semibold">Utilized</p>
          <p className="font-semibold">Removable</p>
        </div>
        <Progress css="sm" value={utilizedValue} max={qty} />
        <div className="flex justify-between mt-1">
          <p className="">
            {utilizedValue}
            <span className="text-black/30 ml-[2px]">({utilizedPercent}%)</span>
          </p>
          <p className="">
            {removableValue}
            <span className="text-black/30 ml-[2px]">({remoablePercent}%)</span>
          </p>
        </div>
      </div>
    </div>
  );
};
