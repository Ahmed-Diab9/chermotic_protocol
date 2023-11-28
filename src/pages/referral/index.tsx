import { Tab } from '@headlessui/react';
import { ChevronRightIcon, LinkIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAccount, useConnect } from 'wagmi';

import { EpochBoard } from '~/stories/template/EpochBoard';
import { ReferralHistory } from '~/stories/template/ReferralHistory';
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
              <BlurText label="Referrals Program" color="chrm" />
              <div className="flex items-center justify-between mt-10">
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
                  <h3 className="text-4xl">Your Rewards in Epoch #3</h3>
                  <div className="flex py-6 mt-5 px-7 panel panel-translucent">
                    <div className="w-1/2 pl-2 pr-8 border-r">
                      <div className="flex">
                        <div>
                          <h5 className="mb-2 text-xl text-primary-light">As Referrer</h5>
                          <h4 className="text-3xl">340K rCHRMA</h4>
                        </div>
                        <Tag
                          label="Tier 0"
                          className="ml-auto text-xl font-semibold"
                          css="default"
                        />
                      </div>
                      <div className="flex gap-10 mt-8 text-lg">
                        <div>
                          <p className="mb-2 text-primary-light">Total Fees</p>
                          <p className="text-xl">434.00</p>
                        </div>
                        <div>
                          <p className="mb-2 text-primary-light">Rebate</p>
                          <p className="text-xl">25%</p>
                        </div>
                      </div>
                      <p className="mt-6 text-sm text-primary-light">
                        * The total fee is the sum of all fees for the people you invited.
                      </p>
                    </div>
                    {/* Case 1 */}
                    <div className="w-1/2 pl-10">
                      <div className="flex">
                        <div>
                          <h5 className="mb-2 text-xl text-primary-light">As Trader</h5>
                          <h4 className="text-3xl">340K rCHRMA</h4>
                        </div>
                        <Tag
                          label="Referrer’s Tier 3"
                          className="ml-auto text-xl font-semibold"
                          css="default"
                        />
                      </div>
                      <div className="flex gap-10 mt-8 text-lg">
                        <div>
                          <p className="mb-2 text-primary-light">Total Fees</p>
                          <p className="text-xl">434.00</p>
                        </div>
                        <div>
                          <p className="mb-2 text-primary-light">Rebate</p>
                          <p className="text-xl">25%</p>
                        </div>
                      </div>
                      <p className="mt-6 text-sm text-primary-light">
                        * Trader’s Referral reward is reflected and aggretated in Trade Rewards.
                      </p>
                    </div>
                    {/* Case 2 */}
                    {/* <div className="w-1/2 pl-12">
                      <div className="mb-10">
                        <h5 className="mb-3 text-xl text-primary-light">As Trader</h5>
                        <p>
                          Join <Button label="Chromatic Referral Program" css="underlined" /> to
                          Earn Rewards Together.
                        </p>
                      </div>
                      <Button
                        label="Add Referral Address"
                        iconLeft={<LinkIcon className="!w-4" />}
                        css="active"
                        size="xl"
                        className="!h-8"
                      />
                    </div> */}
                  </div>
                </article>
                <article>
                  <div className="mb-8">
                    <h3 className="text-4xl">Referral History </h3>
                    <p className="mt-2 text-lg text-primary-light">
                      Histroy of my participation in the Trading Reward Program up to now. (Epoch #1
                      - Epoch #2)
                    </p>
                  </div>
                  <ReferralHistory />
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
