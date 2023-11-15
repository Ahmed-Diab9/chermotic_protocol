import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { createPortal } from 'react-dom';
import { BoosterIcon, CoinStackIcon } from '~/assets/icons/Icon';
import { Avatar } from '~/stories/atom/Avatar';
import { Button } from '~/stories/atom/Button';
import { AirdropStampModal } from '../AirdropStampModal';
import { useAirdropStamp } from './hooks';
import './style.css';
import StampActive from '/src/assets/images/stamp_active.png';
import StampEmpty from '/src/assets/images/stamp_empty.png';
import StampFail from '/src/assets/images/stamp_fail.png';
import StampSuccess from '/src/assets/images/stamp_success.png';

export interface AirdropStampProps {}

export const AirdropStamp = (props: AirdropStampProps) => {
  const {
    schedules,
    bonusRewards,
    activeSchedule,
    creditText,
    boosterText,
    hasModal,
    onScheduleClick,
    onModalConfirm,
    onModalClose,
  } = useAirdropStamp();

  return (
    <>
      <div className="p-5 text-left panel AirdropStamp">
        <div className="pb-5 border-b">
          <div className="pl-3">
            <div className="flex">
              <h4 className="mb-5 text-3xl text-primary-light">Sign-In Rewards</h4>
              <p className="ml-auto text-lg text-primary-light">
                The date changes at 9am local time (UTC+09:00)
              </p>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <BoosterIcon className="w-6" />
              <p className="text-lg">{boosterText}</p>
            </div>
            <div className="flex items-center gap-2">
              <CoinStackIcon className="w-6" />
              <p className="text-lg">{creditText}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-around mt-6">
          {schedules.map((schedule) => (
            <div
              key={`${schedule.id}-${schedule.date}-${schedule.name}`}
              className={`stamp stamp-${schedule.status}`}
            >
              <h5 className="text-lg capitalize text-primary-light">{schedule.name}</h5>
              <div className="mt-3 mb-2">
                {schedule.status === 'active' ? (
                  // TODO: button onclick
                  <button
                    title="Open Today's Reward"
                    onClick={onScheduleClick}
                    className="relative flex items-center justify-center"
                  >
                    <Avatar className="w-20 h-20 !bg-transparent" src={StampActive} />
                    <h4 className="absolute top-[52px] text-chrm text-lg">+5</h4>
                  </button>
                ) : (
                  <div className="relative flex items-center justify-center">
                    <Avatar
                      className="w-20 h-20"
                      src={
                        schedule.status === 'success'
                          ? StampSuccess
                          : schedule.status === 'fail'
                          ? StampFail
                          : StampEmpty
                      }
                    />
                    <h4
                      className={`absolute top-[52px] ${
                        schedule.status === 'success'
                          ? 'text-price-higher text-xl'
                          : schedule.status === 'fail'
                          ? 'text-price-lower text-xl'
                          : 'text-primary/10 text-lg'
                      }`}
                    >
                      +{schedule.status === 'fail' ? '0' : '5'}
                    </h4>
                  </div>
                )}
              </div>
              {schedule.status === 'success' && (
                <CheckCircleIcon className="w-6 text-price-higher" />
              )}
              {schedule.status === 'fail' && <XCircleIcon className="w-6 text-price-lower" />}
              {/* TODO: button onclick */}
              {schedule.status === 'active' && (
                <Button
                  label="Check In"
                  css="chrm"
                  size="sm"
                  className="!h-5 !font-bold"
                  onClick={onScheduleClick}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      {createPortal(
        <AirdropStampModal
          schedules={schedules}
          activeSchedule={activeSchedule}
          bonusRewards={bonusRewards}
          isOpen={hasModal}
          onClick={onModalConfirm}
          onClose={onModalClose}
        />,
        document.getElementById('modal')!
      )}
    </>
  );
};
