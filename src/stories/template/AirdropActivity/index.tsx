import { ArrowLongRightIcon } from '@heroicons/react/24/outline';
import { useAirdropActivity } from './hooks';
import './style.css';
import BoosterLgIcon from '/src/assets/images/airdrop_booster.svg';
import CreditLgIcon from '/src/assets/images/airdrop_credit.svg';

export interface AirdropActivityProps {}

export const AirdropActivity = (props: AirdropActivityProps) => {
  const { airdropAssets, formattedCredit, isLoading } = useAirdropActivity();
  return (
    <div className="text-lg text-left AirdropActivity">
      <div className="flex gap-5 mt-5">
        <div className="flex flex-col w-1/2 panel">
          <div className="flex items-center justify-between pb-5 border-b">
            <div className="flex items-center gap-4">
              <img src={CreditLgIcon} alt="airdrop credit" />
              <h4 className="text-[28px]">Credit</h4>
            </div>
            <h4 className="text-[28px]">{formattedCredit}</h4>
          </div>
          <p className="pt-5">
            Credits are a commodity paid to run Random Boxes in Airdrop. 100 Credits are required to
            open one random box.
          </p>
          <div className="flex items-end justify-between pt-12 mt-auto mr-5">
            <div className="flex flex-col gap-2">
              <ArrowInfo label="My Credit History" href="" />
              {/* <ArrowInfo label="More Detail" href="" /> */}
            </div>
            <div className="flex flex-col gap-2">
              <h5 className="mb-1 text-xl text-chrm">How to get Credit</h5>
              <ArrowInfo label="Zealy Quest" href="#" />
              <ArrowInfo label="Galxe Quest" href="#" />
              <ArrowInfo label="Trading Competition" />
            </div>
          </div>
        </div>
        <div className="flex flex-col w-1/2 panel">
          <div className="flex items-center justify-between pb-5 border-b">
            <div className="flex items-center gap-4">
              <img src={BoosterLgIcon} alt="airdrop credit" />
              <h4 className="text-[28px]">Booster</h4>
            </div>
            <div className="flex flex-col gap-2 text-right">
              <h4 className="text-[28px]">{airdropAssets?.booster}</h4>
              <p className="text-primary-light">17 Booster Chances</p>
            </div>
          </div>
          <p className="pt-5">
            Boosters increase the probability of getting a lot of CHRMA from the Random Box. By
            using Booster, you can earn approximately twice as much rCHRMA as without using Booster.
          </p>
          <div className="flex items-end justify-between pt-12 mt-auto mr-5">
            <div className="flex flex-col gap-2">
              <ArrowInfo label="My Credit History" href="" />
              {/* <ArrowInfo label="More Detail" href="" /> */}
            </div>
            <div className="flex flex-col gap-2">
              <h5 className="mb-1 text-xl text-chrm">How to get Credit</h5>
              <ArrowInfo label="Galaxe Quest" href="#" />
              <ArrowInfo label="Trade Competition" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ArrowInfoProps {
  label: string;
  href?: string;
}

const ArrowInfo = (props: ArrowInfoProps) => {
  const { label, href } = props;
  if (href)
    return (
      <a
        href={href}
        className="flex items-center gap-1 text-primary-light hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        <ArrowLongRightIcon className="w-4" />
        <span>{label}</span>
      </a>
    );
  else
    return (
      <p className="flex items-center gap-1 text-primary-light">
        <ArrowLongRightIcon className="w-4" />
        <span>{label}</span>
      </p>
    );
};
