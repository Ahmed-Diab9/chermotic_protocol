import { ArrowLongRightIcon } from '@heroicons/react/24/outline';
import KeyIcon from '/src/assets/images/airdrop_key.svg';
import CreditIcon from '/src/assets/images/airdrop_credit.svg';
import BoosterIcon from '/src/assets/images/airdrop_booster.svg';
import './style.css';

export interface AirdropActivityProps {}

export const AirdropActivity = (props: AirdropActivityProps) => {
  return (
    <div className="text-left AirdropActivity">
      <div className="panel">
        <div className="flex">
          <div className="flex items-center justify-between w-1/2 pr-10">
            <div className="flex items-center gap-4">
              <img src={KeyIcon} alt="airdrop credit" />
              <div>
                <h4 className="text-[28px]">Whitelist NFT</h4>
                <p className="mt-2 text-primary-light">From Chromatic Discord</p>
              </div>
            </div>
            <h4 className="text-[28px]">1</h4>
          </div>
          <div className="flex flex-col justify-center w-1/2 pl-10 border-l">
            <p className="mb-2">
              Key들은 Airdrop에 참여하기 위해 꼭 필요한 Whitelist 증표이자 입장권입니다. 키가 있어야
              Airdrop의 Random Box를 열 수 있습니다.
            </p>
            <ArrowLink label="How to get Whitelist NFT" href="" />
          </div>
        </div>
      </div>
      <div className="flex gap-5 mt-5">
        <div className="w-1/2 panel">
          <div className="flex items-center justify-between pb-5 border-b">
            <div className="flex items-center gap-4">
              <img src={CreditIcon} alt="airdrop credit" />
              <h4 className="text-[28px]">Credit</h4>
            </div>
            <h4 className="text-[28px]">2,345</h4>
          </div>
          <p className="pt-5">
            Key들은 Airdrop에 참여하기 위해 꼭 필요한 Whitelist 증표이자 입장권입니다. 키가 있어야
            Airdrop의 Random Box를 열 수 있습니다.
          </p>
          <div className="flex items-end justify-between pt-12 mr-5">
            <div className="flex flex-col gap-2">
              <ArrowLink label="My Credit History" href="" />
              <ArrowLink label="More Detail" href="" />
            </div>
            <div className="flex flex-col gap-2">
              <h5 className="mb-1 text-xl text-chrm">How to get Credit</h5>
              <ArrowLink label="Galaxe Quest" href="" />
              <ArrowLink label="Trade Competition" href="" />
              <ArrowLink label="Gleam Events" href="" />
            </div>
          </div>
        </div>
        <div className="w-1/2 panel">
          <div className="flex items-center justify-between pb-5 border-b">
            <div className="flex items-center gap-4">
              <img src={BoosterIcon} alt="airdrop credit" />
              <h4 className="text-[28px]">Booster</h4>
            </div>
            <div className="flex flex-col gap-2 text-right">
              <h4 className="text-[28px]">17</h4>
              <p className="text-primary-light">17 Booster Chances</p>
            </div>
          </div>
          <p className="pt-5">
            Key들은 Airdrop에 참여하기 위해 꼭 필요한 Whitelist 증표이자 입장권입니다. 키가 있어야
            Airdrop의 Random Box를 열 수 있습니다.
          </p>
          <div className="flex items-end justify-between pt-12 mr-5">
            <div className="flex flex-col gap-2">
              <ArrowLink label="My Credit History" href="" />
              <ArrowLink label="More Detail" href="" />
            </div>
            <div className="flex flex-col gap-2">
              <h5 className="mb-1 text-xl text-chrm">How to get Credit</h5>
              <ArrowLink label="Galaxe Quest" href="" />
              <ArrowLink label="Trade Competition" href="" />
              <ArrowLink label="Gleam Events" href="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ArrowLinkProps {
  label: string;
  href: string;
}

const ArrowLink = (props: ArrowLinkProps) => {
  const { label, href } = props;

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
};
