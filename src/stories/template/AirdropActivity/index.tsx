import { ArrowLongRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { AIRDROP_LINKS } from '~/constants/airdrop';
import { useAirdropActivity } from './hooks';
import './style.css';
import BoosterLgIcon from '/src/assets/images/airdrop_booster.svg';
import CreditLgIcon from '/src/assets/images/airdrop_credit.svg';

export interface AirdropActivityProps {
  onHistoryClick?: (tab: 'credit' | 'booster') => unknown;
}

export const AirdropActivity = (props: AirdropActivityProps) => {
  const { onHistoryClick } = props;
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
            Credits are the currency used to activate Random Boxes in the Airdrop. One hundred
            credits are needed to unlock a single random box.
          </p>
          <div className="flex flex-col gap-4 pt-10 mt-auto xl:items-end xl:justify-between xl:flex-row xl:gap-0">
            <div className="flex flex-col xl:max-w-[324px] xl:w-2/3 gap-2">
              <h5 className="self-start mb-1 text-xl text-chrm">How to get Credit</h5>
              <p className="text-primary-light">
                Credits can be acquired through the completion of Chromatic's Zealy Quests or the
                fulfillment of special missions offered on Discord.
              </p>
            </div>
            <div className="flex flex-col gap-1 xl:pl-5">
              <ArrowInfo label="My Credit History" onClick={() => onHistoryClick?.('credit')} />
              <ArrowInfo label="Learn more" to={AIRDROP_LINKS['GET_CREDITS']} />
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
              <p className="text-primary-light">{airdropAssets?.booster} Booster Chances</p>
            </div>
          </div>
          <p className="pt-5">
            Boosters increase the probability of getting more rCHRMA from the Random Box. By using
            Booster, you can earn approximately twice as much rCHRMA as without using Booster.
          </p>
          <div className="flex flex-col gap-4 pt-10 mt-auto xl:items-end xl:justify-between xl:flex-row xl:gap-0">
            <div className="flex flex-col xl:max-w-[324px] xl:w-2/3 gap-2">
              <h5 className="self-start mb-1 text-xl text-chrm">How to get Booster</h5>
              <p className="text-primary-light">
                Boosters can be acquired by attending to airdrop page for 6 consecutive days in a
                week or the fulfillment of special missions offered on Discord.
              </p>
            </div>
            <div className="flex flex-col gap-1 xl:pl-5">
              <ArrowInfo label="My Booster History" onClick={() => onHistoryClick?.('booster')} />
              <ArrowInfo label="Learn more" to={AIRDROP_LINKS['GET_BOOSTERS']} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ArrowInfoProps {
  label: string;
  to?: string;
  onClick?: () => unknown;
}

export const ArrowInfo = (props: ArrowInfoProps) => {
  const { label, to, onClick } = props;
  if (to)
    return (
      <Link
        to={to}
        className="flex items-center gap-1 text-primary-light hover:underline whitespace-nowrap"
        target="_blank"
        rel="noopener noreferrer"
      >
        <ArrowLongRightIcon className="w-4" />
        <span>{label}</span>
      </Link>
    );
  else
    return (
      <p
        className="flex items-center gap-1 text-primary-light whitespace-nowrap cursor-pointer hover:underline"
        onClick={onClick}
      >
        <ArrowLongRightIcon className="w-4" />
        <span>{label}</span>
      </p>
    );
};
