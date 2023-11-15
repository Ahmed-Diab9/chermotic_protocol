import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { createPortal } from 'react-dom';
import { BoosterIcon, CoinStackIcon } from '~/assets/icons/Icon';
import { useTimeDifferences } from '~/hooks/useTimeDifferences';
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
  const { hours, minutes, unit, prefix } = useTimeDifferences();
  const message = `The date changes at ${hours}${unit} local time (UTC${prefix}${hours.padStart(
    2,
    '0'
  )}:${minutes.padStart(2, '0')})`;
  return (
    <>
      <div className="p-5 text-left panel AirdropStamp">
        <div className="pb-5 border-b">
          <div className="pl-3">
            <div className="flex">
              <h4 className="mb-5 text-3xl text-primary-light">Sign-In Rewards</h4>
              <p className="ml-auto text-lg text-primary-light">{message}</p>
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
                  <button title="Open Today's Reward" onClick={onScheduleClick}>
                    <Avatar className="w-20 h-20 !bg-transparent" src={StampActive} />
                  </button>
                ) : (
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
