import { Thumbnail } from "~/stories/atom/Thumbnail";
import { Avatar } from "~/stories/atom/Avatar";
import { Tag } from "~/stories/atom/Tag";
import { Button } from "~/stories/atom/Button";
import { Progress } from "~/stories/atom/Progress";
import { Loading } from "~/stories/atom/Loading";
import { Tab } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Disclosure } from "@headlessui/react";
import "../../atom/Tabs/style.css";
import { BigNumber } from "ethers";
import { LPReceipt } from "~/typings/receipt";
import { Market, Token } from "~/typings/market";
import { isValid } from "~/utils/valid";
import { usePrevious } from "~/hooks/usePrevious";

interface PoolProgressProps {
  token?: Token;
  market?: Market;
  receipts?: LPReceipt[];
  onReceiptClaim?: (id: BigNumber) => unknown;
  onReceiptClaimBatch?: () => unknown;
}

export const PoolProgress = ({
  token,
  market,
  receipts = [],
  onReceiptClaim,
  onReceiptClaimBatch,
}: PoolProgressProps) => {
  const previousReceipts = usePrevious(receipts, true);
  return (
    <div className="!flex flex-col border PoolProgress tabs tabs-line tabs-base rounded-2xl">
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button className="relative flex items-center justify-center py-5">
              <h4 className="font-bold">IN PROGRESS ({receipts.length})</h4>
              <ChevronDownIcon
                className={`${
                  open ? "rotate-180 transform" : ""
                } w-6 text-black/30 absolute right-6`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="px-5 text-gray-500 border-t">
              <Tab.Group>
                <Tab.List className="!justify-start !gap-8 pt-5 px-7">
                  <Tab>All</Tab>
                  <Tab>Minting (2)</Tab>
                  <Tab>Burning (3)</Tab>
                </Tab.List>
                <div className="mt-4">
                  <Button
                    label="Claim All"
                    className="w-full border-gray"
                    size="xl"
                    onClick={() => onReceiptClaimBatch?.()}
                  />
                </div>
                <Tab.Panels className="flex-auto mt-5">
                  {/* tab1 - all */}
                  <Tab.Panel className="flex flex-col gap-3 mb-5">
                    {isValid(market) &&
                      (receipts || previousReceipts).map((receipt) => (
                        <ProgressItem
                          key={receipt.id.toString()}
                          title={receipt.title}
                          status={receipt.status}
                          detail="Waiting for the next oracle round"
                          name={receipt.renderName(market)}
                          progressPercent={0}
                          onClick={() => {
                            onReceiptClaim?.(receipt.id);
                          }}
                        />
                      ))}
                    {
                      /**
                       * TODO
                       * CLB 토큰이 소각되고 있는 과정을 보여줄 수 있어야 합니다.
                       * Receipt의 동작이 토큰 발행인지 소각인지 구분할 수 있어야 합니다.
                       * Amount의 단위 파악이 필요합니다. CLB 또는 세틀먼트 토큰
                       */
                      <>
                        <ProgressItem
                          title="minting"
                          status="standby"
                          detail="Waiting for the next oracle round"
                          name="ETH/USD +0.03%"
                          progressPercent={0}
                        />
                        <ProgressItem
                          title="minting"
                          status="completed"
                          detail="3,000.45 CLB"
                          name="ETH/USD +0.03%"
                          progressPercent={0}
                        />
                        <ProgressItem
                          title="burning"
                          status="standby"
                          detail="Waiting for the next oracle round"
                          name="ETH/USD +0.03%"
                          progressPercent={0}
                        />
                        <ProgressItem
                          title="burning"
                          status="in progress"
                          detail="456.00/1,000.00 CLB (46.50%)"
                          name="ETH/USD +0.03%"
                          progressPercent={46.5}
                        />
                        <ProgressItem
                          title="burning"
                          status="completed"
                          detail="1,000.00/1,000.00 CLB (100.00%)"
                          name="ETH/USD +0.03%"
                          progressPercent={100}
                        />
                      </>
                    }
                  </Tab.Panel>

                  {/* tab2 - minting */}
                  <Tab.Panel className="flex flex-col gap-3 mb-5">
                    <ProgressItem
                      title="minting"
                      status="standby"
                      detail="Waiting for the next oracle round"
                      name="ETH/USD +0.03%"
                      progressPercent={0}
                    />
                    <ProgressItem
                      title="minting"
                      status="completed"
                      detail="3,000.45 CLB"
                      name="ETH/USD +0.03%"
                      progressPercent={0}
                    />
                  </Tab.Panel>

                  {/* tab3 - burning */}
                  <Tab.Panel className="flex flex-col gap-3 mb-5">
                    <ProgressItem
                      title="burning"
                      status="standby"
                      detail="Waiting for the next oracle round"
                      name="ETH/USD +0.03%"
                      progressPercent={0}
                    />
                    <ProgressItem
                      title="burning"
                      status="in progress"
                      detail="456.00/1,000.00 CLB (46.50%)"
                      name="ETH/USD +0.03%"
                      progressPercent={46.5}
                    />
                    <ProgressItem
                      title="burning"
                      status="completed"
                      detail="1,000.00/1,000.00 CLB (100.00%)"
                      name="ETH/USD +0.03%"
                      progressPercent={100}
                    />
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
};

interface ProgressItemProps {
  title: "minting" | "burning";
  status: "standby" | "in progress" | "completed";
  detail: string;
  token?: string;
  name: string;
  progressPercent?: number;
  onClick?: () => unknown;
}

const ProgressItem = (props: ProgressItemProps) => {
  const {
    title,
    status,
    detail,
    token = "USDC",
    name,
    progressPercent,
    onClick,
  } = props;

  return (
    <div className="flex flex-col gap-3 px-5 py-4 border rounded-xl">
      <div className="flex items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 capitalize">
          {title}
          <span className="mr-1">
            {status === "standby" ? (
              <Tag label="standby" className="text-[#FF9820] bg-[#FF8900]/10" />
            ) : status === "completed" ? (
              <Tag
                label="completed"
                className="text-[#03C239] bg-[#23F85F]/10"
              />
            ) : (
              <Tag
                label="in progress"
                className="text-[#13D2C7] bg-[#1EFCEF]/10"
              />
            )}
          </span>
        </h4>
        <div className="flex items-center gap-[6px] text-sm tracking-tight text-black text-right">
          <span className="">
            {status === "completed" ? (
              <CheckIcon className="w-4" />
            ) : (
              <Loading size="xs" />
            )}
          </span>
          <p className="">{detail}</p>
        </div>
      </div>
      {title === "burning" ? (
        <Progress value={progressPercent} max={100} />
      ) : (
        <div className="border-t" />
      )}
      <div className="flex items-end gap-3 mt-1">
        <Thumbnail className="rounded" />
        <div>
          <Avatar label={token} size="xs" gap="1" />
          <p className="mt-1 text-left text-black/30">{name}</p>
        </div>
        {status === "standby" ? (
          <Button
            label={title === "burning" ? `Claim ${token}` : "Claim Tokens"}
            size="sm"
            className="ml-auto !text-gray"
            disabled
          />
        ) : (
          <Button
            label={
              title === "burning"
                ? status === "in progress"
                  ? `Stop Process & Claim ${token}`
                  : `Claim ${token}`
                : "Claim Tokens"
            }
            css="active"
            size="sm"
            className="ml-auto"
            onClick={onClick}
          />
        )}
      </div>
    </div>
  );
};
