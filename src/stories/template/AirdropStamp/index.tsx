// import { BoltIcon, CircleStackIcon } from '@heroicons/react/24/solid';
import CoinStackIcon from '~/assets/icons/CoinStackIcon';
import BoosterIcon from '~/assets/icons/BoosterIcon';
import { Button } from '~/stories/atom/Button';
import { Avatar } from '~/stories/atom/Avatar';
import './style.css';

export interface AirdropStampProps {}

export const AirdropStamp = (props: AirdropStampProps) => {
  const week = [
    { name: 'mon', status: 'success', point: '10' },
    { name: 'tue', status: 'fail', point: '10' },
    { name: 'wed', status: 'success', point: '10' },
    { name: 'thu', status: 'empty', point: '10' },
    { name: 'fri', status: 'empty', point: '10' },
    { name: 'sat', status: 'empty', point: '10' },
    { name: 'sun', status: 'empty', point: '10' },
  ];

  return (
    <div className="p-5 text-left panel AirdropStamp">
      <div className="flex pb-5 border-b">
        <div className="w-1/2 pl-5 pr-10">
          <h4 className="mb-5 text-3xl text-primary-light">Sign-In Rewards</h4>
          <div className="flex items-center gap-2 mb-4">
            <BoosterIcon className="w-6" />
            <p className="text-xl">Sign-In 7 days in a week & get 1 booster</p>
          </div>
          <div className="flex items-center gap-2">
            <CoinStackIcon className="w-6" />
            <p className="text-xl">Sign-In 5 days in a week & get 50 extra credits</p>
          </div>
        </div>
        <div className="flex flex-col justify-between w-1/2 pl-10 pr-5 border-l">
          <div className="flex">
            <h4 className="mb-5 text-3xl text-primary-light">Currently Claimable</h4>
            <Button label="Claim Now" size="sm" css="active" className="!text-base ml-auto" />
          </div>
          <div className="flex items-center gap-10">
            <div className="flex flex-col items-center gap-2">
              <BoosterIcon className="w-6" />
              <p className="text-xl">26 Credits</p>
            </div>
            <span className="text-3xl">+</span>
            <div className="flex flex-col items-center gap-2">
              <CoinStackIcon className="w-6" />
              <p className="text-xl">1 Booster</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between px-10 mt-6">
        {week.map((item) => (
          <div key={item.name} className={`stamp stamp-${item.status}`}>
            <h5 className="text-xl capitalize text-primary-light">{item.name}</h5>
            <Avatar
              className="w-20 h-20 mt-3"
              src={
                item.status === 'success'
                  ? '/src/assets/images/stamp_success.png'
                  : item.status === 'fail'
                  ? '/src/assets/images/stamp_fail.png'
                  : ''
              }
            />

            {item.status === 'success' && <p className="mt-2 text-xl">+{item.point}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};
