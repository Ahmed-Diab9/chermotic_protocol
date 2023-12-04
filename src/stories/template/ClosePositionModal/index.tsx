import '~/stories/template/Modal/style.css';

import { Dialog } from '@headlessui/react';
import { Avatar } from '~/stories/atom/Avatar';
import { Button } from '~/stories/atom/Button';
import { ModalCloseButton } from '~/stories/atom/ModalCloseButton';
import { Tag } from '~/stories/atom/Tag';
import { Position } from '~/typings/position';
import { useClosePositonModal } from './hooks';

export interface ClosePositionModalProps {
  isOpen?: boolean;
  onClose?: () => unknown;

  position?: Position;
}

export function ClosePositonModal(props: ClosePositionModalProps) {
  const { isOpen, isMutating, onClose, position, onPositionClose } = useClosePositonModal(props);

  return (
    <Dialog open={isOpen} onClose={() => onClose?.()}>
      <div className="backdrop" aria-hidden="true" />
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 shadow-xl">
        <Dialog.Panel className="modal modal-base">
          <Dialog.Title className="modal-title">
            Close Position
            <ModalCloseButton onClick={onClose} />
          </Dialog.Title>
          {/* <div className="w-[100px] mx-auto border-b border-2 !border-primary"></div> */}
          <Dialog.Description className="gap-5 modal-content" as="div">
            <article className="px-4 pt-3 pb-4 modal-box">
              <div className="flex items-center gap-3 pb-3 mb-4 border-b">
                <Avatar size="2xl" src={position?.marketImage} />
                <div className="flex items-center gap-2 mt-1">
                  <h5>{position?.tokenName}</h5>
                  <h5 className="pl-2 border-l border-primary-light">
                    {position?.marketDescription}
                  </h5>
                  {/* <Tag label={direction} /> */}
                  <Tag label={position?.direction} />
                </div>
              </div>
              <div className="flex gap-5 mb-3">
                <div className="w-1/2">
                  <p className="mb-1 text-primary-light">Entry Price</p>
                  <p>{position?.entryPrice}</p>
                </div>
                <div className="w-1/2">
                  <p className="mb-1 text-primary-light">Leverage</p>
                  <Tag label={position?.leverage} className="tag-leverage" />
                </div>
              </div>
              <div className="flex gap-5">
                <div className="w-1/2">
                  <p className="mb-1 text-primary-light">Contract qty</p>
                  <p>{position?.qty}</p>
                </div>
                <div className="w-1/2">
                  <p className="mb-1 text-primary-light">Collateral</p>
                  <p>{position?.collateral}</p>
                </div>
              </div>
            </article>

            <article className="flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex text-primary-light">Estimated PnL</div>
                <div className={'flex items-baseline gap-1 ' + position?.pnlClass}>
                  <h4 className="text-xl">{position?.pnl}</h4>
                  <p>({position?.pnlPercentage})</p>
                </div>
                {/* <div className="flex items-baseline gap-1 text-price-lower">
                  <h4 className="text-xl">-34.12 cETH</h4>
                  <p>(-12.78%)</p>
                </div> */}
              </div>
              <p className="pt-3 mt-3 border-t text-primary-light">
                You will close {position?.qty} {position?.tokenName}-{position?.marketDescription}{' '}
                position with and estimated profit of{' '}
                <span className={position?.pnlClass}>{position?.pnl}</span>.
              </p>
            </article>
          </Dialog.Description>
          <div className="modal-button">
            <Button
              label="Close Position"
              size="xl"
              className="text-lg"
              css="active"
              onClick={() => onPositionClose()}
              disabled={isMutating}
            />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
