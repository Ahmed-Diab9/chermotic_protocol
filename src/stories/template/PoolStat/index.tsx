import { isNil } from 'ramda';
import { AssetManagementIcon, ClpSupplyIcon } from '~/assets/icons/PoolIcon';
import { Avatar } from '~/stories/atom/Avatar';
import { Progress } from '~/stories/atom/Progress';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { usePoolStat } from './hooks';
import './style.css';

export interface PoolStatProps {}

export const PoolStat = (props: PoolStatProps) => {
  const { aum, clpSupply, utilization, utilizedValue, progressRate, tokenImage, clpImage } =
    usePoolStat();
  return (
    <div className="p-5 PoolStat">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AssetManagementIcon className="w-6" />
            <div className="flex text-left">
              <h5 className="text-lg">AUM</h5>
              <TooltipGuide
                label="aum"
                tip="Asset under Management. Total amount of liquidity provided to this Liquidity Pool"
                outLink=""
              />
            </div>
          </div>
          <SkeletonElement isLoading={isNil(aum)} width={60}>
            <div className="text-right">
              <Avatar label={aum} size="sm" fontSize="xl" gap="1" src={tokenImage} />
            </div>
          </SkeletonElement>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClpSupplyIcon className="w-6" />
            <div className="flex">
              <h5 className="text-lg">CLP supply</h5>
              <TooltipGuide label="clp-supply" tip="The amount of CLP in circulation" outLink="" />
            </div>
          </div>
          <SkeletonElement isLoading={isNil(clpSupply)} width={60}>
            <div className="text-right">
              <Avatar label={clpSupply} size="sm" fontSize="xl" gap="1" src={clpImage} />
            </div>
          </SkeletonElement>
        </div>
      </div>
      <div className="flex flex-col gap-3 pt-5 mt-5 mb-2 border-t">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex">
              <h5 className="text-lg">Pool Utilization</h5>
              <TooltipGuide
                label="pool-utilization"
                tip="Liquidity provided in liquidity bins / Total liquidity managed by the pool"
                outLink=""
              />
            </div>
            <div className="text-right">
              <h5 className="text-xl">{utilization}</h5>
              <p className="text-base text-primary-lighter">{utilizedValue}</p>
            </div>
          </div>
          <Progress value={progressRate} max={100} />
        </div>
      </div>
    </div>
  );
};
