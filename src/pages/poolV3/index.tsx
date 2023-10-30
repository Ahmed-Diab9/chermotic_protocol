import { isNil, isNotNil } from 'ramda';
import PlusIcon from '~/assets/icons/PlusIcon';
import useBackgroundGradient from '~/hooks/useBackgroundGradient';
import { useLpLocal } from '~/hooks/useLpLocal';
import { useMarketLocal } from '~/hooks/useMarketLocal';
import { useTokenLocal } from '~/hooks/useTokenLocal';
import { useAppSelector } from '~/store';
import { Avatar } from '~/stories/atom/Avatar';
import { Button } from '~/stories/atom/Button';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { Tag } from '~/stories/atom/Tag';
import { Toast } from '~/stories/atom/Toast';
import { ChainModal } from '~/stories/container/ChainModal';
import { MarketSelectV3 } from '~/stories/molecule/MarketSelectV3';
import { BookmarkBoardV3 } from '~/stories/template/BookmarkBoardV3';
import { Footer } from '~/stories/template/Footer';
import { HeaderV3 } from '~/stories/template/HeaderV3';
import { PoolAnalyticsV3 } from '~/stories/template/PoolAnalyticsV3';
import { PoolDetail } from '~/stories/template/PoolDetail';
import { PoolMenuV3 } from '~/stories/template/PoolMenuV3';
import { PoolPanelV2 } from '~/stories/template/PoolPanelV2';
import { PoolPerformance } from '~/stories/template/PoolPerformance';
import { PoolStat } from '~/stories/template/PoolStat';
import { formatDecimals } from '~/utils/number';
import './style.css';

const PoolV3 = () => {
  useTokenLocal();
  useMarketLocal();
  useLpLocal();
  const { onLoadBackgroundRef } = useBackgroundGradient();

  const selectedLp = useAppSelector((state) => state.lp.selectedLp);
  const lpTitle = isNotNil(selectedLp)
    ? `${selectedLp.settlementToken.name}-${selectedLp.market.description}`
    : undefined;
  const price = formatDecimals(selectedLp?.price, selectedLp?.decimals, 3, true);

  return (
    <>
      <div id="gradient" ref={(element) => onLoadBackgroundRef(element)}>
        <div id="prev"></div>
        <div id="current"></div>
      </div>
      <div className="flex flex-col min-h-[100vh] min-w-[1280px] w-full relative">
        <BookmarkBoardV3 />
        <HeaderV3 />
        <section className="flex flex-col w-full px-5 mx-auto mt-8 mb-20 grow max-w-[1400px]">
          <MarketSelectV3 />
          <div className="flex items-stretch gap-5 mt-8">
            <div className="flex-none w-[240px]">
              <h4 className="mt-3 mb-2 text-left">Pools</h4>
              <PoolMenuV3 />
            </div>
            <div className="mt-10">
              <div className="mb-10 text-left">
                <div className="flex items-center mb-5">
                  <SkeletonElement isLoading={isNil(lpTitle)} width={120} containerClassName="mr-3">
                    <h2 className="mr-3 text-4xl">
                      {lpTitle} {selectedLp?.name} Pool
                    </h2>
                  </SkeletonElement>
                  <Tag label={`high risk`} className="tag-risk-high" />
                  <Button
                    label="Metamask"
                    iconLeft={<PlusIcon className="w-3 h-3" />}
                    className="ml-4 !pl-2 !pt-[2px] !bg-gray-light/60"
                    gap="1"
                    size="sm"
                  />
                </div>
                <p className="text-lg text-primary-light">0000000000000000000000000000</p>
              </div>
              <div className="flex items-center justify-between mb-3 text-lg text-primary">
                {/* To be added later */}
                {/* <div>esChroma Rewards: 500 esChroma/day</div> */}
                <div className="flex gap-2 ml-auto text-xl">
                  CLP Price: {price}
                  <Avatar
                    label={selectedLp?.settlementToken.name}
                    size="xs"
                    gap="1"
                    fontSize="xl"
                    src={selectedLp?.settlementToken.image}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-auto overflow-hidden">
                  <div className="panel panel-translucent">
                    <PoolPanelV2 />
                  </div>
                  <div className="mt-10">
                    <PoolAnalyticsV3 />
                  </div>
                </div>
                <div className="flex-none w-[420px] flex flex-col gap-3">
                  {/* To be added later */}
                  {/* <PoolBalance /> */}
                  <div className="panel panel-translucent">
                    <PoolStat />
                  </div>
                  <div className="panel panel-translucent">
                    <PoolPerformance />
                  </div>
                  <div className="panel panel-translucent">
                    <PoolDetail />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Footer />
        <Toast />
        <ChainModal />
      </div>
    </>
  );
};

export default PoolV3;
