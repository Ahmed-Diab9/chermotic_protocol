import '~/stories/template/Modal/style.css';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Avatar } from '~/stories/atom/Avatar';
import { Button } from '~/stories/atom/Button';
import { Tag } from '~/stories/atom/Tag';
import { ModalCloseButton } from '~/stories/atom/ModalCloseButton';
import { useClosePositonModal } from './hooks';

export function ClosePositonModal() {
  const {
    onClose,
    // tokenName,
    // marketDescription,
    // direction,
  } = useClosePositonModal();
  let [isOpen, setIsOpen] = useState(true);

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="backdrop" aria-hidden="true" />
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 shadow-xl">
        <Dialog.Panel className="modal modal-base">
          <Dialog.Title className="modal-title">
            Close Position
            <ModalCloseButton onClick={onClose} />
          </Dialog.Title>
          {/* <div className="w-[100px] mx-auto border-b border-2 !border-primary"></div> */}
          <Dialog.Description className="gap-5 modal-content">
            <article className="px-4 pt-3 pb-4 modal-box">
              <div className="flex items-center gap-3 pb-3 mb-4 border-b">
                <Avatar size="2xl" />
                <div className="flex items-center gap-2 mt-1">
                  <h5>
                    {/* {tokenName} */}
                    CHRM
                  </h5>
                  <h5 className="pl-2 border-l border-primary-light">
                    {/* {marketDescription} */}
                    ETH/USD
                  </h5>
                  {/* <Tag label={direction} /> */}
                  <Tag label="long" />
                </div>
              </div>
              <div className="flex gap-5 mb-3">
                <div className="w-1/2">
                  <p className="mb-1 text-primary-light">Entry Price</p>
                  <p>$27,625.42</p>
                </div>
                <div className="w-1/2">
                  <p className="mb-1 text-primary-light">Leverage</p>
                  <Tag label="10.00x" className="tag-leverage" />
                </div>
              </div>
              <div className="flex gap-5">
                <div className="w-1/2">
                  <p className="mb-1 text-primary-light">Contract qty</p>
                  <p>1,500.00 cETH</p>
                </div>
                <div className="w-1/2">
                  <p className="mb-1 text-primary-light">Collateral</p>
                  <p>1,500.00 cETH</p>
                </div>
              </div>
            </article>

            <article className="flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex text-primary-light">Estimated PnL</div>
                <div className="flex items-baseline gap-1 text-price-higher">
                  <h4 className="text-xl">+34.12 cETH</h4>
                  <p>(+12.78%)</p>
                </div>
                {/* <div className="flex items-baseline gap-1 text-price-lower">
                  <h4 className="text-xl">-34.12 cETH</h4>
                  <p>(-12.78%)</p>
                </div> */}
              </div>
              <p className="pt-3 mt-3 border-t text-primary-light">
                You will close 15,000.00 cETH-cETH/USD position with and estimated profit of{' '}
                <span className="text-price-higher">+34.12 cETH</span>.
              </p>
            </article>
          </Dialog.Description>
          <div className="modal-button">
            <Button
              label="Close Position"
              size="xl"
              className="text-lg"
              css="active"
              // onClick={}
            />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
