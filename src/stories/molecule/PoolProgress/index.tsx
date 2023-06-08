import { Thumbnail } from "~/stories/atom/Thumbnail";
import { Avatar } from "~/stories/atom/Avatar";
import { Tag } from "~/stories/atom/Tag";
import { Button } from "~/stories/atom/Button";
import { Progress } from "~/stories/atom/Progress";
import { Loading } from "~/stories/atom/Loading";
import { Tab } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { ArrowPathRoundedSquareIcon } from "@heroicons/react/20/solid";
import "../../atom/Tabs/style.css";

import { LPToken, LiquidityPool } from "../../../typings/pools";
import { Token } from "../../../typings/market";

interface PoolProgressProps {}

export const PoolProgress = ({ ...props }: PoolProgressProps) => {
  return (
    <div className="w-[500px] h-[1000px] !flex flex-col px-5 pt-8 pb-6 border PoolProgress tabs tabs-line tabs-base rounded-xl">
      <Tab.Group>
        <Tab.List className="!justify-start !gap-8 px-7">
          <Tab>All</Tab>
          <Tab>Minting (2)</Tab>
          <Tab>Burning (3)</Tab>
        </Tab.List>
        <Tab.Panels className="flex-auto mt-7">
          {/* tab1 - all */}
          <Tab.Panel>
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
          </Tab.Panel>

          {/* tab2 - minting */}
          <Tab.Panel>
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
          <Tab.Panel>
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
        <div className="mt-auto">
          <Button label="Claim All" />
        </div>
      </Tab.Group>
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
}

const ProgressItem = (props: ProgressItemProps) => {
  const {
    title,
    status,
    detail,
    token = "USDC",
    name,
    progressPercent,
  } = props;

  return (
    <div className="flex flex-col gap-3 px-5 py-4 mb-3 border rounded-xl">
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
        <p className="flex items-center gap-[6px] text-sm tracking-tight text-black">
          <span className="">
            {status === "completed" ? (
              <CheckIcon className="w-4" />
            ) : (
              <Loading size="xs" />
            )}
          </span>
          {detail}
        </p>
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
          <p className="mt-1 text-black/30">{name}</p>
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
          />
        )}
      </div>
    </div>
  );
};
