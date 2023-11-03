import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { BoosterIcon, CoinStackIcon } from '~/assets/icons/Icon';
import { Button } from '~/stories/atom/Button';
import { Avatar } from '~/stories/atom/Avatar';
import StampSuccess from '/src/assets/images/stamp_success.png';
import StampFail from '/src/assets/images/stamp_fail.png';
import StampActive from '/src/assets/images/stamp_active.png';
import StampEmpty from '/src/assets/images/stamp_empty.png';
import './style.css';

export interface AirdropStampProps {}

export const AirdropStamp = (props: AirdropStampProps) => {
  const week = [
    { name: 'mon', status: 'success' },
    { name: 'tue', status: 'fail' },
    { name: 'wed', status: 'success' },
    { name: 'thu', status: 'active' },
    { name: 'fri', status: 'empty' },
    { name: 'sat', status: 'empty' },
    { name: 'sun', status: 'empty' },
  ];

  return (
    <div className="p-5 text-left panel AirdropStamp">
      <div className="flex pb-5 border-b">
        <div className="w-1/2 pl-5 pr-10">
          <h4 className="mb-5 text-3xl text-primary-light">Sign-In Rewards</h4>
          <div className="flex items-center gap-2 mb-2">
            <BoosterIcon className="w-6" />
            <p className="text-lg">Sign-In 7 days in a week & get 1 booster</p>
          </div>
          <div className="flex items-center gap-2">
            <CoinStackIcon className="w-6" />
            <p className="text-lg">Sign-In 5 days in a week & get 50 extra credits</p>
          </div>
        </div>
        <div className="ml-auto text-lg text-primary-light">
          The date changes at 9am local time (UTC+09:00)
        </div>
      </div>
      <div className="flex justify-between px-10 mt-6">
        {week.map((item) => (
          <div key={item.name} className={`stamp stamp-${item.status}`}>
            <h5 className="text-lg capitalize text-primary-light">{item.name}</h5>
            <div className="mt-3 mb-2">
              {item.status === 'active' ? (
                // TODO: button onclick
                <button title="Open Today's Reward">
                  <Avatar className="w-20 h-20 !bg-transparent" src={StampActive} />
                </button>
              ) : (
                <Avatar
                  className="w-20 h-20"
                  src={
                    item.status === 'success'
                      ? StampSuccess
                      : item.status === 'fail'
                      ? StampFail
                      : StampEmpty
                  }
                />
              )}
            </div>
            {item.status === 'success' && <CheckCircleIcon className="w-6 text-price-higher" />}
            {item.status === 'fail' && <XCircleIcon className="w-6 text-price-lower" />}
            {/* TODO: button onclick */}
            {item.status === 'active' && (
              <Button label="Check In" css="chrm" size="sm" className="!h-5 !font-bold" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
