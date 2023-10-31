import { Toast } from '~/stories/atom/Toast';
import { ChainModal } from '~/stories/container/ChainModal';
import { Tab } from '@headlessui/react';
import '~/stories/atom/Tabs/style.css';
import { BookmarkBoardV3 } from '~/stories/template/BookmarkBoardV3';
import { Footer } from '~/stories/template/Footer';
import { HeaderV3 } from '~/stories/template/HeaderV3';
import { BlurText } from '~/stories/atom/BlurText';
import { AirdropStamp } from '~/stories/template/AirdropStamp';
import { AirdropHistory } from '~/stories/template/AirdropHistory';
import { AirdropBoard } from '~/stories/template/AirdropBoard';
import { AirdropActivity } from '~/stories/template/AirdropActivity';
import { Button } from '~/stories/atom/Button';
import OutlinkIcon from '~/assets/icons/OutlinkIcon';
import RandomboxImage from '~/assets/images/airdrop_randombox.png';
import ZealyIcon from '~/assets/images/zealy.png';
import GalxeIcon from '~/assets/images/galxe.png';
import {
  ChevronRightIcon,
  ExclamationTriangleIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';

import { useMarketLocal } from '~/hooks/useMarketLocal';
import { useTokenLocal } from '~/hooks/useTokenLocal';

import './style.css';

function Airdrop() {
  useTokenLocal();
  useMarketLocal();

  return (
    <>
      <div className="page-container bg-gradient">
        <BookmarkBoardV3 />
        <HeaderV3 />
        <main>
          <div className="tabs tabs-flex-column">
            <Tab.Group>
              <div className="flex gap-10">
                <Tab.List className="tabs-list min-w-[210px]">
                  <Tab>Airdrop 1</Tab>
                  <Tab>My History</Tab>
                  <button
                    onClick={() => {
                      window.open('https://chromatic.finance/', '_blank');
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
                      <div className="w-[560px]">
                        <BlurText
                          label="Chromatic Airdrop Program"
                          className="text-[60px]"
                          color="chrm"
                        />
                      </div>
                      <div className="mt-10 text-left">
                        <p className="text-xl text-primary-light">
                          Airdrop season 1 for Testnet has just begun!
                        </p>
                        <p className="text-xl text-primary-light">
                          Airdrop 1 period: Oct 20 2023 ~ Jan 20 2024
                        </p>
                      </div>
                    </section>
                    <section className="flex flex-col gap-[140px] mt-16">
                      <article>
                        <AirdropStamp />
                      </article>

                      <article>
                        <div className="flex justify-between mb-5 text-left">
                          <h2 className="text-4xl">My Activities</h2>
                          <div className="flex items-center gap-3">
                            <p className="text-lg text-primary-light">
                              Zealy PX is automatically reflected as a credit once an hour. 1PX =
                              1Credit
                            </p>
                            <Button
                              label="Update Now"
                              css="active"
                              size="sm"
                              className="!text-lg"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-4 py-2 pl-4 pr-5 text-lg rounded bg-price-lower/10">
                          <img src={ZealyIcon} alt="zealy" className="w-[42px]" />
                          <p className="text-left text-price-lower">
                            In order to automatically convert XP earned by completing quests in
                            Zealy into credits for Chromatic Airdrop, <br />
                            you must connect your wallet at Zealy Profile {'>'} Linked account.
                          </p>
                          <div className="pl-8 ml-auto border-l">
                            <Button
                              label="My Zealy Profile"
                              iconRight={<ChevronRightIcon />}
                              className=""
                              size="lg"
                              css="underlined"
                              href=""
                            />
                          </div>
                        </div>
                        <AirdropActivity />
                        <div className="flex items-center gap-4 py-2 pl-4 pr-5 mt-5 text-lg panel">
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
                        </div>
                        {/* <div className="flex justify-between mt-10">
                          <h4 className="text-xl">Galxe activity update</h4>
                          <Button
                            label="Update Credit and Booster by registering NFT acquired from Galxe"
                            css="underlined"
                            className="!text-lg text-primary-light"
                          />
                        </div> */}
                        {/* GalxeIcon */}
                      </article>

                      <article>
                        <div className="flex justify-between gap-5 text-left">
                          <h2 className="text-4xl">rCHR Random Box</h2>
                          <Button
                            label="What is rCHR?"
                            css="underlined"
                            className="text-primary-light"
                          />
                        </div>
                        <div className="flex flex-col items-center mt-10">
                          <img src={RandomboxImage} alt="ramdom box" className="w-[280px] mb-5" />
                          <div className="flex mb-10 text-lg text-left border-y text-primary-light">
                            <div className="w-1/4 px-3 py-5">
                              <p>Credit is required to open the Random Box to obtain rCHR.</p>
                            </div>
                            <div className="w-1/4 px-3 py-5 border-l">
                              <p>
                                Random Box can be activated and opened on 1/1/2018 after the end of
                                the Testnet period.
                              </p>
                            </div>
                            <div className="w-1/4 px-3 py-5 border-l">
                              <p>To open Random Box, you need Discord Log-in.</p>
                            </div>
                            <div className="w-1/4 px-3 py-5 border-l">
                              <p>
                                When signing in, you must be registered on the Chromatic Protocol
                                server.
                              </p>
                              <Button
                                label="Discord Chromatic Server"
                                iconRight={<ChevronRightIcon />}
                                css="underlined"
                                className="mt-5 text-primary"
                              />
                            </div>
                          </div>
                          <Button
                            label="Open Random Box"
                            css="chrm-hover"
                            size="3xl"
                            className="!text-xl !w-[280px]"
                          />
                        </div>

                        {/* <div className="flex justify-around mt-16">
                          <div>
                            <img src={RandomboxImage} alt="ramdom box" className="w-[400px] mb-7" />
                          </div>
                          <div className="w-1/2 mt-4 text-xl text-left">
                            <ul className="flex flex-col gap-3 list-disc text-primary-light">
                              <li>Credit is required to open the Random Box to obtain rCHR.</li>
                              <li>
                                Random Box can be activated and opened on 1/1/2018 after the end of
                                the Testnet period.
                              </li>
                              <li className="text-primary">
                                To open Random Box, you need Discord Log-in, and when signing in,
                                you must be registered on the Chromatic Protocol server.
                              </li>
                            </ul>
                            <div className="my-10">
                              <Button
                                label="Go to Discord Chromatic Server"
                                css="underlined"
                                className="text-primary-light"
                              />
                            </div>
                            <Button
                              label="Open Enthusiast Box"
                              css="chrm-hover"
                              size="3xl"
                              className="!text-xl !min-w-[280px]"
                            />
                          </div>
                        </div> */}
                      </article>

                      <article>
                        <div className="flex items-baseline">
                          <h2 className="text-4xl">Leader board</h2>
                          <div className="ml-auto text-lg text-primary-light">
                            The date changes at 9am local time (UTC+09:00)
                          </div>
                        </div>
                        <div className="p-5 mt-10 mb-12 panel">
                          <div className="flex justify-between">
                            <div className="w-1/3">
                              <h2 className="text-4xl">10</h2>
                              <h4 className="mt-3 text-xl text-primary-light">Participants</h4>
                            </div>
                            {/* if "Whitelist NFT (Key)"" is excluded, "Key holders info" is also excluded. */}
                            {/* <div className="w-1/4 border-l">
                              <h2 className="text-4xl">3,445</h2>
                              <h4 className="mt-3 text-xl text-primary-light">Whitelist NFT</h4>
                            </div> */}
                            <div className="w-1/3 border-l">
                              <h2 className="text-4xl">13</h2>
                              <h4 className="mt-3 text-xl text-primary-light">Total Credits</h4>
                            </div>
                            <div className="w-1/3 border-l">
                              <h2 className="text-4xl">120</h2>
                              <h4 className="mt-3 text-xl text-primary-light">Total Boosters</h4>
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
                        {/* <h2 className="text-4xl">My board</h2> */}
                        <div className="ml-auto text-lg text-primary-light">
                          The date changes at 9am local time (UTC+09:00)
                        </div>
                      </div>
                      <div className="p-5 mt-10 panel">
                        <div className="flex justify-between">
                          {/* if "Whitelist NFT (Key)"" is excluded, "Key holders info" is also excluded. */}
                          {/* <div className="w-1/3">
                            <h2 className="text-4xl">10</h2>
                            <h4 className="mt-3 text-xl text-primary-light">Whitelist NFT</h4>
                          </div> */}
                          <div className="w-1/2">
                            <h2 className="text-4xl">3,445</h2>
                            <h4 className="mt-3 text-xl text-primary-light">Credits</h4>
                          </div>
                          <div className="w-1/2 border-l">
                            <h2 className="text-4xl">13</h2>
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
        <Toast />
        <ChainModal />
      </div>
    </>
  );
}

export default Airdrop;
