import { Avatar } from "../../atom/Avatar";
import { Button } from "../../atom/Button";
import { Input } from "../../atom/Input";
import { Popover } from "@headlessui/react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { ChevronDoubleUpIcon } from "@heroicons/react/20/solid";
import "./style.css";

type User = {
  name: string;
  contract: string;
};

interface AssetPopoverProps {
  // onClick?: () => void;
  user?: User;
  onLogin?: () => void;
}

export const AssetPopover = ({
  user,
  onLogin,
  ...props
}: AssetPopoverProps) => {
  return (
    <div className="AssetPopover relative flex items-center justify-between gap-6 border rounded-2xl w-[40%] max-w-[500px] min-h-[100px]">
      <div className="flex items-center gap-2 ml-10">
        <Avatar size="xs" />
        <h4 className="">Asset balance</h4>
      </div>
      <div className="flex flex-col gap-3 mr-10 text-right">
        {user ? (
          <>
            <h2 className="text-2xl">1,542.07 USDC</h2>
            <Popover.Group className="flex gap-3">
              <Popover>
                <Popover.Button className="flex items-center gap-3 px-5 btn btn-default btn-base">
                  Deposit
                </Popover.Button>
                <Popover.Panel className="popover-panel">
                  <div className="w-full gap-2 pt-2">
                    <article className="flex gap-4 p-4 overflow-hidden border rounded-xl">
                      <p className="flex-none text-black/50">My Account</p>
                      <div className="flex gap-2">
                        <div className="shrink max-w-[50%] overflow-hidden">
                          <p className="inline-block overflow-ellipsis">
                            0x446c225ec3E...6d66C0496c077cC
                          </p>
                        </div>
                        <Button
                          size="sm"
                          css="noline"
                          iconOnly={<ArrowTopRightOnSquareIcon />}
                        />
                      </div>
                    </article>
                    <section className="flex mt-5 text-left">
                      <article className="flex flex-col gap-4">
                        <h2>Deposit</h2>
                        <div className="flex gap-1">
                          <Avatar size="xs" />
                          <h4 className="">USDC</h4>
                        </div>
                        <div>
                          <h4 className="mb-2">Asset Value</h4>
                          <p>3,025.23 USDC</p>
                        </div>
                        <div>
                          <h4 className="mb-2">Available Margin</h4>
                          <p>225.23 USDC</p>
                        </div>
                      </article>
                      <article className="flex flex-col gap-4 max-w-[220px] ml-7 pl-7 border-l">
                        <h2>Amount</h2>
                        <div>
                          <Input align="right" placeholder="0" />
                          <div className="flex gap-1 mt-2">
                            {/* 버튼 누르면 값이 input에 입력되면서 active 상태됨, input value가 바뀌면 active 해제됨 */}
                            <Button label="25%" size="sm" css="active" />{" "}
                            <Button label="50%" size="sm" />
                            <Button label="75%" size="sm" />
                            <Button label="Max" size="sm" />
                          </div>
                        </div>
                        <p className="text-sm text-black/30">
                          Please set additional values to apply to the basic
                          formula in Borrow Fee. Calculated based on open
                          Interest and stop profit/Loss rate.
                        </p>
                      </article>
                    </section>
                    <div className="mt-6 mb-3 text-center">
                      <Button label="Deposit" size="lg" className="w-full" />
                      <Button
                        iconOnly={<ChevronDoubleUpIcon />}
                        size="sm"
                        css="noline"
                        className="mt-3"
                      />
                    </div>
                  </div>
                </Popover.Panel>
              </Popover>
              <Popover>
                <Popover.Button className="flex items-center gap-3 px-5 btn btn-default btn-base">
                  Withdraw
                </Popover.Button>
                {/* Deposit popover-panel 구성요소와 동일 */}
                <Popover.Panel className="popover-panel">
                  <div className="w-full gap-2 pt-2">
                    <article className="flex gap-4 p-4 overflow-hidden border rounded-xl">
                      <p className="flex-none text-black/50">My Account</p>
                      <div className="flex gap-2">
                        <div className="shrink max-w-[50%] overflow-hidden">
                          <p className="inline-block overflow-ellipsis">
                            0x446c225ec3E...6d66C0496c077cC
                          </p>
                        </div>
                        <Button
                          size="sm"
                          css="noline"
                          iconOnly={<ArrowTopRightOnSquareIcon />}
                        />
                      </div>
                    </article>
                    <section className="flex mt-5 text-left">
                      <article className="flex flex-col gap-4">
                        <h2>Withdraw</h2>
                        <div className="flex gap-1">
                          <Avatar size="xs" />
                          <h4 className="">USDC</h4>
                        </div>
                        <div>
                          <h4 className="mb-2">Asset Value</h4>
                          <p>2,025.23 USDC</p>
                        </div>
                        <div>
                          <h4 className="mb-2">Available Margin</h4>
                          <p>125.23 USDC</p>
                        </div>
                      </article>
                      <article className="flex flex-col gap-4 max-w-[220px] ml-7 pl-7 border-l">
                        <h2>Amount</h2>
                        <div>
                          <Input align="right" placeholder="0" />
                          <div className="flex gap-1 mt-2">
                            {/* 버튼 누르면 값이 input에 입력되면서 active 상태됨, input value가 바뀌면 active 해제됨 */}
                            <Button label="25%" size="sm" css="active" />
                            <Button label="50%" size="sm" />
                            <Button label="75%" size="sm" />
                            <Button label="Max" size="sm" />
                          </div>
                        </div>
                        <p className="text-sm text-black/30">
                          Please set additional values to apply to the basic
                          formula in Borrow Fee. Calculated based on open
                          Interest and stop profit/Loss rate.
                        </p>
                      </article>
                    </section>
                    <div className="mt-6 mb-3 text-center">
                      <Button label="Withdraw" size="lg" className="w-full" />
                      <Button
                        iconOnly={<ChevronDoubleUpIcon />}
                        size="sm"
                        css="noline"
                        className="mt-3"
                      />
                    </div>
                  </div>
                </Popover.Panel>
              </Popover>
            </Popover.Group>
          </>
        ) : (
          <>
            <Button label="Connect Wallet" />
          </>
        )}
      </div>
    </div>
  );
};
