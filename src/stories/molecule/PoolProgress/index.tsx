import { Thumbnail } from "~/stories/atom/Thumbnail";
import { Avatar } from "~/stories/atom/Avatar";
import { Button } from "~/stories/atom/Button";
import { Progress } from "~/stories/atom/Progress";
import { Tab } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { ArrowPathRoundedSquareIcon } from "@heroicons/react/20/solid";
import "../../atom/Tabs/style.css";

import { LPToken, LiquidityPool } from "../../../typings/pools";
import { Token } from "../../../typings/market";

interface PoolProgressProps {}

export const PoolProgress = ({ ...props }: PoolProgressProps) => {
  return (
    <div className="w-[500px] px-5 py-8 border PoolProgress tabs tabs-line tabs-base rounded-xl">
      <Tab.Group>
        <Tab.List className="!justify-start !gap-8 px-7">
          <Tab>All</Tab>
          <Tab>Minting (2)</Tab>
          <Tab>Burning (6)</Tab>
        </Tab.List>
        <Tab.Panels className="mt-7">
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
              title="burning"
              status="in process"
              detail="456.00/1,000.00 CLB (46.5%)"
              name="ETH/USD +0.03%"
              progressPercent={46.5}
            />
            <ProgressItem
              title="burning"
              status="completed"
              detail="1,000.00/1,000.00 CLB (100%)"
              name="ETH/USD +0.03%"
              progressPercent={100}
            />
          </Tab.Panel>
          {/* tab2 - minting */}
          <Tab.Panel>Tab2</Tab.Panel>
          {/* tab3 - burning */}
          <Tab.Panel>Tab3</Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

interface ProgressItemProps {
  title: "minting" | "burning";
  status: "standby" | "in process" | "completed";
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
    <div className="flex flex-col gap-4 px-5 py-4 mb-3 border rounded-xl">
      <div className="flex items-center justify-between gap-2">
        <h4 className="flex items-center capitalize">
          <span className="mr-1">
            {status === "standby" ? (
              <ProgressStatusIcon className="text-[#FF8A00]" />
            ) : status === "completed" ? (
              <ProgressStatusIcon className="text-[#00E23F]" />
            ) : (
              <ProgressStatusIcon className="text-[#08E3D6]" />
            )}
          </span>
          {title} | {status}
        </h4>
        <p className="flex items-center gap-1 text-sm text-black/30">
          <span className="">
            {status === "completed" ? (
              <CheckIcon className="w-4" />
            ) : (
              <ArrowPathRoundedSquareIcon className="w-3" />
            )}
          </span>
          {detail}
        </p>
      </div>
      <Progress value={progressPercent} max={100} />
      <div className="flex items-end gap-3">
        <Thumbnail className="rounded" />
        <div>
          <Avatar label={token} size="xs" gap="1" />
          <p className="mt-1 text-black/30">{name}</p>
        </div>
        <Button
          label={
            title === "burning"
              ? status === "in process"
                ? `Stop Process & Claim ${token}`
                : `Claim ${token}`
              : "Claim Tokens"
          }
          size="sm"
          className="ml-auto"
        />
      </div>
    </div>
  );
};

interface ProgressStatusIconProps {
  className: string;
}

const ProgressStatusIcon = (props: ProgressStatusIconProps) => {
  const { className } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="6"
      height="6"
      fill="none"
      viewBox="0 0 6 6"
      className={className}
    >
      <circle cx="3" cy="3" r="3" className="fill-current" />
    </svg>
  );
};
