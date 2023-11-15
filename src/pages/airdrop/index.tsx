import { Tab } from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAccount, useConnect } from 'wagmi';

import { OutlinkIcon } from '~/assets/icons/Icon';
import { ChromaticLogo } from '~/assets/icons/Logo';
import RandomboxImage from '~/assets/images/airdrop_randombox.png';
import ZealyIcon from '~/assets/images/zealy.png';
import { useAirdropAssets } from '~/hooks/airdrops/useAirdropAssets';
import { useAirdropLeaderBoard } from '~/hooks/airdrops/useAirdropLeaderBoard';
import { useAirdropSync } from '~/hooks/airdrops/useAirdropSync';
import { useMarketLocal } from '~/hooks/useMarketLocal';
import { useTokenLocal } from '~/hooks/useTokenLocal';
import { useAppSelector } from '~/store';

import { AIRDROP_LINKS } from '~/constants/airdrop';
import { useTimeDifferences } from '~/hooks/useTimeDifferences';
import { BlurText } from '~/stories/atom/BlurText';
import { Button } from '~/stories/atom/Button';
import { Loading } from '~/stories/atom/Loading';
import '~/stories/atom/Tabs/style.css';
import { Toast } from '~/stories/atom/Toast';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { ChainModal } from '~/stories/container/ChainModal';
import { AirdropActivity } from '~/stories/template/AirdropActivity';
import { AirdropBoard } from '~/stories/template/AirdropBoard';
import { AirdropHistory } from '~/stories/template/AirdropHistory';
import { AirdropStamp } from '~/stories/template/AirdropStamp';
import { AirdropZealyConnectModal } from '~/stories/template/AirdropZealyConnectModal';
import { AirdropZealyConvertModal } from '~/stories/template/AirdropZealyConvertModal';
import { Footer } from '~/stories/template/Footer';
import { HeaderV3 } from '~/stories/template/HeaderV3';
import { Modal } from '~/stories/template/Modal';
import { numberFormat } from '~/utils/number';
import './style.css';

function Airdrop() {
  const { airdropAssets } = useAirdropAssets();
  const { syncState, isMutating, synchronize, onExternalNavigate, onModalClose } = useAirdropSync();
  const { refreshAssets } = useAirdropAssets();
  const { filterLabels, labelMap, selectedIndex } = useAppSelector((state) => state.airdrop);
  const { metadata } = useAirdropLeaderBoard({
    type: labelMap[filterLabels[selectedIndex]],
  });
  useTokenLocal();
  useMarketLocal();
  const historyTabRef = useRef<HTMLDivElement>(null);

  const { isConnected: _isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  function onConnect() {
    return connectAsync({ connector: connectors[0] });
  }
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'history') {
      historyTabRef.current?.click();
    }
  }, [searchParams]);

  const [randomboxModalOpen, setRandomboxModalOpen] = useState(false);
  const { hours, minutes, unit } = useTimeDifferences();
  const message = `The date changes at ${hours}${unit} local time (UTC+${hours.padStart(
    2,
    '0'
  )}:${minutes.padStart(2, '0')})`;

  return (
    <>
      <div className="page-container bg-gradient-chrm">
        <AirdropZealyConnectModal
          isOpen={Boolean(!isMutating && syncState?.isFailed)}
          onClick={() => {
            onExternalNavigate(AIRDROP_LINKS['HOW_TO_CONNECT'], true);
          }}
          to={AIRDROP_LINKS['HOW_TO_CONNECT']}
          onClose={onModalClose}
        />
        <AirdropZealyConvertModal
          isOpen={Boolean(!isMutating && syncState?.isZealyConnected)}
          syncData={syncState}
          onClick={onModalClose}
          onClose={onModalClose}
        />
        <HeaderV3 />
        {_isConnected ? (
          <>
            <main className="max-w-[1400px]">
              <div className="wrapper-tabs">
                <Tab.Group>
                  <div className="flex gap-10">
                    <Tab.List className="tabs-list min-w-[210px] tabs-flex-column">
                      <Tab>Season 1</Tab>
                      <Tab ref={historyTabRef}>My History</Tab>
                      <button
                        onClick={() => {
                          onExternalNavigate(AIRDROP_LINKS['AIRDROP_INTRO']);
                        }}
                        className="flex gap-2 text-primary-light"
                      >
                        How to Participate
                        <OutlinkIcon />
                      </button>
                    </Tab.List>
                    <Tab.Panels className="flex-auto block">
                      <Tab.Panel>
                        <section>
                          <h2 className="mb-5 text-4xl font-semibold text-left text-primary">
                            Chromatic Airdrop Season 1
                          </h2>
                          <div className="flex flex-wrap items-end mb-12">
                            <BlurText
                              label="May the $CHRMA be with you!"
                              className="text-[60px] tracking-tight w-[620px]"
                              color="chrm"
                            />
                            <div className="ml-auto text-right">
                              <p className="text-xl text-primary">
                                Season 1 Period: Nov 2023 - 1Q 2024
                              </p>
                              <p className="mt-1 text-lg text-primary-light">
                                The end date will be announced later.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 px-5 py-4 text-lg panel">
                            <div className="w-4/5 text-left">
                              <p className="text-left text-primary">
                                Airdrop Season 1 will be evaluated based on community activity and
                                contributions during the testnet (Arbitrum Goerli) and the initial
                                months of the mainnet (Arbitrum One) period, from November 2023 to
                                some point in the first quarter of 2024, and rCHRMA will be
                                distributed (or vested) accordingly.
                              </p>
                            </div>
                            <div className="flex flex-col pl-8 ml-auto border-l ">
                              <Button
                                label="Learn more"
                                iconRight={<ChevronRightIcon />}
                                className="whitespace-nowrap"
                                size="lg"
                                css="underlined"
                                href={AIRDROP_LINKS['AIRDROP_INTRO']}
                                onClick={(event) => {
                                  event.preventDefault();
                                  onExternalNavigate(AIRDROP_LINKS['AIRDROP_INTRO']);
                                }}
                              />
                            </div>
                          </div>
                        </section>
                        <section className="flex flex-col gap-[140px] mt-5">
                          <article>
                            <AirdropStamp />
                          </article>

                          <article>
                            <div className="flex justify-between mb-5 text-left">
                              <h2 className="text-4xl">My Activities</h2>
                              <div className="flex items-center gap-3">
                                <p className="text-lg text-primary-light">
                                  Please convert your Zealy XP to Credit. 1XP = 1Credit
                                </p>
                                <Button
                                  label="Convert XP to Credit"
                                  // TODO: show icon when loading
                                  iconLeft={isMutating ? <Loading /> : null}
                                  disabled={isMutating}
                                  css="active"
                                  size="sm"
                                  className="!text-lg"
                                  onClick={async () => {
                                    await synchronize();
                                    refreshAssets();
                                  }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-4 py-2 pl-4 pr-5 text-lg rounded bg-price-lower/10">
                              <img src={ZealyIcon} alt="zealy" className="w-[42px]" />
                              <div className="w-2/3 text-left">
                                <p className="text-left text-price-lower">
                                  To convert XP from Zealy quests to Chromatic Airdrop credits,
                                  connect your wallet at Zealy Profile {'>'} Linked Account. Click
                                  <Button
                                    label="here"
                                    css="underlined"
                                    size="lg"
                                    className="text-primary"
                                    href={AIRDROP_LINKS['HOW_TO_CONNECT']}
                                    onClick={(event) => {
                                      event.preventDefault();
                                      onExternalNavigate(AIRDROP_LINKS['HOW_TO_CONNECT']);
                                    }}
                                  />
                                  to get informed how to connect wallet address to zealy linked
                                  account.
                                </p>
                              </div>
                              <div className="flex flex-col items-start pl-8 ml-auto border-l">
                                <Button
                                  label="Zealy Linked account"
                                  iconRight={<ChevronRightIcon />}
                                  className="whitespace-nowrap"
                                  size="lg"
                                  css="underlined"
                                  onClick={() => {
                                    onExternalNavigate(AIRDROP_LINKS['LINKED_ACCOUNT']);
                                  }}
                                  href={AIRDROP_LINKS['LINKED_ACCOUNT']}
                                />
                                <p className="mt-[2px] text-sm text-price-lower">
                                  Zealy login required
                                </p>
                              </div>
                            </div>
                            <AirdropActivity />
                            {/* <div className="flex items-center gap-4 py-2 pl-4 pr-5 mt-5 text-lg panel">
                              <img src={GalxeIcon} alt="galxe" className="w-[24px]" />
                              <p className="text-left">
                                You can update Credit and Booster by registering NFT acquired from
                                Galxe.
                              </p>
                              <div className="pl-8 ml-auto border-l">
                                <Button
                                  label="Upload NFT"
                                  iconRight={<ArrowUpTrayIcon />}
                                  className=""
                                  size="lg"
                                  css="underlined"
                                  href=""
                                />
                              </div>
                            </div> */}
                          </article>

                          <article>
                            <div className="flex justify-between gap-5 text-left">
                              <h2 className="text-4xl">rCHRMA Random Box</h2>
                              <div className="flex items-center">
                                <p className="text-primary-light">What is rCHRMA?</p>
                                <TooltipGuide
                                  label="airdrop-rchr"
                                  tip="rCHRMA is a rewarded CHRMA token that can be attributed to CHRMA."
                                />
                              </div>
                            </div>
                            <div className="flex flex-col items-center mt-10">
                              <img src={RandomboxImage} alt="ramdom box" className="w-[330px]" />
                              <div className="flex mb-10 text-lg text-left border-y text-primary-light">
                                <div className="w-1/3 px-3 py-5">
                                  <p>
                                    rCHRMA can be obtained through a random box, requiring 100
                                    credits for a single box opening.
                                  </p>
                                </div>
                                <div className="w-1/3 px-3 py-5 border-l">
                                  <p>
                                    The Random Box will be activated and opened in the first quarter
                                    of 2024.
                                  </p>
                                </div>
                                <div className="w-1/3 px-3 py-5 border-l">
                                  <p>
                                    To open the Random Box, you must join a designated Discord
                                    server and complete phone verification. (The address of the
                                    designated Discord server will be announced later.)
                                  </p>
                                </div>
                              </div>
                              <Button
                                label="Open Random Box"
                                css="chrm-hover"
                                size="3xl"
                                className="!text-xl !w-[280px]"
                                onClick={() => setRandomboxModalOpen(true)}
                              />
                            </div>
                          </article>

                          <article>
                            <div className="flex items-baseline">
                              <h2 className="text-4xl">Leader board</h2>
                              <div className="ml-auto text-lg text-primary-light">{message}</div>
                            </div>
                            <div className="p-5 mt-10 mb-12 panel">
                              <div className="flex justify-between">
                                <div className="w-1/3">
                                  <h2 className="text-4xl">{metadata?.participants}</h2>
                                  <h4 className="mt-3 text-xl text-primary-light">Participants</h4>
                                </div>
                                <div className="w-1/3 border-l">
                                  <h2 className="text-4xl">{metadata?.totalCredit}</h2>
                                  <h4 className="mt-3 text-xl text-primary-light">Total Credits</h4>
                                </div>
                                <div className="w-1/3 border-l">
                                  <h2 className="text-4xl">{metadata?.totalBooster}</h2>
                                  <h4 className="mt-3 text-xl text-primary-light">
                                    Total Boosters
                                  </h4>
                                </div>
                              </div>
                            </div>
                            {/* <div className="mt-3 mb-12">
                          <div className="flex items-center gap-4 py-2 pl-4 pr-5 text-lg rounded bg-price-lower/10">
                            <div className="flex gap-3 text-price-lower">
                              <ExclamationTriangleIcon className="w-4" />
                              <p className="text-left">
                                Traders who place fake bids that cannot be accepted will be filtered
                              </p>
                            </div>
                            <div className="pl-8 ml-auto border-l">
                              <Button
                                label="Learn More"
                                iconRight={<ChevronRightIcon />}
                                className=""
                                size="lg"
                                css="underlined"
                                href=""
                              />
                            </div>
                          </div>
                        </div> */}
                            <AirdropBoard />
                          </article>
                        </section>
                      </Tab.Panel>
                      <Tab.Panel>
                        <section>
                          <div className="flex items-baseline">
                            <BlurText label="My History" className="text-[60px]" color="chrm" />
                            <div className="ml-auto text-lg text-primary-light">{message}</div>
                          </div>
                          <div className="p-5 mt-10 panel">
                            <div className="flex justify-between">
                              <div className="w-1/2">
                                <h2 className="text-4xl">
                                  {numberFormat(airdropAssets?.credit ?? 0, { useGrouping: true })}
                                </h2>
                                <h4 className="mt-3 text-xl text-primary-light">Credits</h4>
                              </div>
                              <div className="w-1/2 border-l">
                                <h2 className="text-4xl">{airdropAssets?.booster}</h2>
                                <h4 className="mt-3 text-xl text-primary-light">Boosters</h4>
                              </div>
                            </div>
                          </div>
                        </section>
                        <section className="mt-16">
                          <AirdropHistory />
                        </section>
                      </Tab.Panel>
                    </Tab.Panels>
                  </div>
                </Tab.Group>
              </div>
            </main>
            <Footer />
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
        <Toast />
        <ChainModal />
        {randomboxModalOpen && (
          <Modal
            title="Random Box"
            paragraph="Random box is unavailable yet"
            subParagraph="The random box is scheduled to be released in the first quarter of 2024."
            buttonLabel="OK"
            buttonCss="default"
            onClick={() => setRandomboxModalOpen(false)}
            isOpen={randomboxModalOpen}
            setIsOpen={setRandomboxModalOpen}
          />
        )}
      </div>
    </>
  );
}

export default Airdrop;
