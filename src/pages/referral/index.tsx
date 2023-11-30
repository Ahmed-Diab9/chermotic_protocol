import {
  ChevronRightIcon,
  ClipboardDocumentCheckIcon,
  ClipboardIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import { useAccount, useConnect } from 'wagmi';

import { EpochBoard } from '~/stories/template/EpochBoard';
import TierChart from '~/stories/atom/TierChart';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { ReferralHistory } from '~/stories/template/ReferralHistory';
import { ChromaticLogo } from '~/assets/icons/Logo';
import { BlurText } from '~/stories/atom/BlurText';
import { Button } from '~/stories/atom/Button';
import { Tag } from '~/stories/atom/Tag';
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
                <Button label="Get my Referral Code" css="active" size="xl" className="!h-8" />
              </div>
            </section>
            <div className="flex gap-12 mt-10">
              <section className="flex flex-col flex-auto gap-24">
                <article>
                  <div className="flex items-center gap-2">
                    <h3 className="text-4xl">My Tier</h3>
                    {/* TODO: show tag whitelisted or not */}
                    {/* <span className="text-lg font-bold tag tag-default">
                      <ClipboardIcon className="h-4 mr-[2px] -ml-[2px]" />
                      Not Whitelisted
                    </span> */}
                    <span className="text-lg font-bold !normal-case tag tag-long">
                      <ClipboardDocumentCheckIcon className="h-4 mr-[2px] -ml-[2px]" />
                      Whitelisted
                    </span>
                  </div>
                  <div className="flex items-center py-6 mt-3">
                    <div className="flex items-center justify-center w-1/2 pr-8 border-r">
                      {/* TODO: set totalFee, numberOfTrader */}
                      <TierChart totalFee={80} numberOfTrader={40} />
                    </div>
                    <div className="w-1/2 pl-10">
                      <h2 className="text-3xl">Tier 1</h2>
                      <div className="flex py-4 mt-3 mb-4 border-y">
                        <div className="flex flex-col justify-between w-1/2">
                          <div className="flex items-center mb-[6px]">
                            <div className="w-3 h-3 mr-1 rounded-full bg-chart-secondary" />
                            <h4 className="text-primary-light">Number of Traders</h4>
                            <TooltipGuide label="number-of-trader" tip="" />
                          </div>
                          <h3>11</h3>
                        </div>
                        <div className="flex flex-col justify-between w-1/2 pl-8">
                          <h4 className="text-primary-light mb-[6px]">Until Tier 2</h4>
                          <Tag css="leverage" label="Eligible" className="self-start text-lg" />
                        </div>
                      </div>
                      <div className="flex">
                        <div className="flex flex-col justify-between w-1/2">
                          <div className="flex items-center mb-[6px]">
                            <div className="w-3 h-3 mr-1 rounded-full bg-chart-primary" />
                            <h4 className="text-primary-light">Total Fees</h4>
                            <TooltipGuide label="total-fee" tip="" />
                          </div>
                          <h3>
                            3,234.23{' '}
                            <span className="text-lg font-semibold text-primary-light">USD</span>
                          </h3>
                        </div>
                        <div className="flex flex-col justify-between w-1/2 pl-8">
                          <h4 className="text-primary-light mb-[6px]">Until Tier 2</h4>
                          <h4 className="text-price-lower">
                            234.23 <span className="font-semibold">USD</span>
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
                <article>
                  <h3 className="text-4xl">My Est. Rewards in Epoch #3</h3>
                  <div className="flex py-6 mt-3">
                    <div className="w-1/2 pr-8 border-r">
                      <div className="flex">
                        <div>
                          <h5 className="mb-2 text-xl text-primary-light">As Referrer</h5>
                          <h3 className="text-3xl">
                            340K{' '}
                            <span className="text-2xl font-semibold text-primary-light">
                              rCHRMA
                            </span>
                          </h3>
                        </div>
                        <Tag
                          label="My Tier 0"
                          className="ml-auto text-xl font-semibold"
                          css="default"
                        />
                      </div>
                      <div className="flex gap-10 mt-8 text-lg">
                        <div>
                          <p className="mb-2 text-primary-light">Total Fees</p>
                          <h4 className="text-xl">
                            434.00 <span className="text-lg text-primary-light">USD</span>
                          </h4>
                        </div>
                        <div>
                          <p className="mb-2 text-primary-light">Rebate</p>
                          <h4 className="text-xl">25%</h4>
                        </div>
                      </div>
                      <p className="mt-6 text-sm text-primary-light">
                        * The total fee is the sum of all fees for the people you invited.
                      </p>
                    </div>
                    {/* Case 1 : connected */}
                    {/* <div className="w-1/2 pl-10">
                      <div className="flex">
                        <div>
                          <h5 className="mb-2 text-xl text-primary-light">As Trader</h5>
                          <h3 className="text-3xl">
                            340K{' '}
                            <span className="text-2xl font-semibold text-primary-light">
                              rCHRMA
                            </span>
                          </h3>
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
                          <h4 className="text-xl">
                            434.00 <span className="text-lg text-primary-light">USD</span>
                          </h4>
                        </div>
                        <div>
                          <p className="mb-2 text-primary-light">Rebate</p>
                          <h4 className="text-xl">25%</h4>
                        </div>
                      </div>
                      <p className="mt-6 text-sm text-primary-light">
                        * Trader’s Referral reward is reflected and aggretated in Trade Rewards.
                      </p>
                    </div> */}
                    {/* Case 2 : not connected */}
                    <div className="flex flex-col items-start justify-between w-1/2 pl-12">
                      <div className="mb-8">
                        <h5 className="mb-3 text-xl text-primary-light">As Trader</h5>
                        <p className="text-lg">
                          Join{' '}
                          <Button label="Chromatic Referral Program" css="underlined" size="lg" />{' '}
                          to Earn Rewards Together.
                        </p>
                      </div>
                      {/* <Button
                        label="Add Referral Address"
                        iconLeft={<LinkIcon className="!w-4" />}
                        css="active"
                        size="xl"
                        className="!h-8 mb-10"
                      /> */}
                    </div>
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
                <EpochBoard />
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
