import { Tab } from '@headlessui/react';
import { ChevronRightIcon, ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAccount, useConnect } from 'wagmi';

import { EpochBoard } from '~/stories/template/EpochBoard';
import { ChromaticLogo } from '~/assets/icons/Logo';
import { BlurText } from '~/stories/atom/BlurText';
import { Button } from '~/stories/atom/Button';
import { Tag } from '~/stories/atom/Tag';
import { Loading } from '~/stories/atom/Loading';
import '~/stories/atom/Tabs/style.css';
import './style.css';

function Referral() {
  const { isConnected: _isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  function onConnect() {
    return connectAsync({ connector: connectors[0] });
  }

  return (
    <>
      {_isConnected ? (
        <>
          <div className="wrapper-tabs">
            <section>
              <BlurText label="Referrals Program" className="text-[52px]" color="chrm" />
              <div className="flex items-center justify-between mt-5">
                <p className="text-lg text-primary-light">
                  Allocate rChroma here to earn a share of protocol earnings.
                </p>
                <Button
                  label="About Referrals"
                  iconRight={<ChevronRightIcon />}
                  css="underlined"
                  className="ml-auto"
                />
              </div>
              <div className="flex justify-between py-5 pr-5 mt-10 border-y">
                <h3 className="text-4xl">Share Referral Code and get Rewards!</h3>
                <Button label="Get your Referral Code" css="active" size="xl" className="!h-8" />
              </div>
            </section>
            <div className="flex gap-12 mt-10">
              <section className="flex flex-col flex-auto gap-20">
                <article>
                  <h3 className="text-4xl">Your Tier</h3>
                </article>
                <article>
                  <h3 className="text-4xl">
                    Your Rewards in <span className="text-chrm">Epoch #3</span>
                  </h3>
                  <div className="flex gap-10 mt-8">
                    <div className="w-1/2">
                      <div className="flex">
                        <div>
                          <h5 className="mb-3 text-xl text-primary-light">As Referrer</h5>
                          <h4 className="text-3xl">340K rCHRMA</h4>
                        </div>
                        <Tag
                          label="Tier 0"
                          className="ml-auto text-xl font-semibold"
                          css="default"
                        />
                      </div>
                      <div className="flex gap-10 text-lg mt-7">
                        <div>
                          <p className="mb-2 text-primary-light">Total Fees</p>
                          <p className="text-xl">434.00</p>
                        </div>
                        <div>
                          <p className="mb-2 text-primary-light">Rebate</p>
                          <p className="text-xl">25%</p>
                        </div>
                      </div>
                    </div>
                    <div className="border-l"></div>
                    <div className="w-1/2">
                      <div className="flex">
                        <div>
                          <h5 className="mb-3 text-xl text-primary-light">As Trader</h5>
                          <h4 className="text-3xl">340K rCHRMA</h4>
                        </div>
                        <Tag
                          label="Tier 0"
                          className="ml-auto text-xl font-semibold"
                          css="default"
                        />
                      </div>
                      <div className="flex gap-10 text-lg mt-7">
                        <div>
                          <p className="mb-2 text-primary-light">Total Fees</p>
                          <p className="text-xl">434.00</p>
                        </div>
                        <div>
                          <p className="mb-2 text-primary-light">Rebate</p>
                          <p className="text-xl">25%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
                <article>
                  <h3 className="text-4xl">Referral History </h3>
                </article>
              </section>
              <section className="w-[400px]">
                <article>
                  <EpochBoard />
                </article>
              </section>
            </div>
          </div>
        </>
      ) : (
        <main>
          <div className="py-10 mx-auto my-20">
            <div className="flex flex-col items-center text-center">
              <ChromaticLogo className="text-inverted dark:text-primary w-[160px] h-auto" />
              <p className="mt-5 mb-10 text-inverted-lighter dark:text-primary-lighter">
                A New Era in Decentralized Perpetual Futures
              </p>
              <Button
                onClick={onConnect}
                label="Connect Wallet"
                css="active"
                size="lg"
                className="!h-[42px] !min-w-[180px]"
              />
            </div>
          </div>
        </main>
      )}
      {/* {ModalOpen && (
        <Modal
          title="Your Referral Code"
        />
      )} */}
    </>
  );
}

export default Referral;
