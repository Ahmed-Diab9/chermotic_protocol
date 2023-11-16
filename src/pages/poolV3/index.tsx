import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { isNil, isNotNil } from 'ramda';
import { useCallback, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { PlusIcon } from '~/assets/icons/Icon';
import useBackgroundGradient from '~/hooks/useBackgroundGradient';
import { useChromaticClient } from '~/hooks/useChromaticClient';
import { useLpLocal } from '~/hooks/useLpLocal';
import { useMarketLocal } from '~/hooks/useMarketLocal';
import { useTokenLocal } from '~/hooks/useTokenLocal';
import { useAppSelector } from '~/store';
import { selectedLpSelector } from '~/store/selector';
import { Avatar } from '~/stories/atom/Avatar';
import { Button } from '~/stories/atom/Button';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { Tag } from '~/stories/atom/Tag';
import { Toast, showCautionToast } from '~/stories/atom/Toast';
import { ChainModal } from '~/stories/container/ChainModal';
import { MarketSelectV3 } from '~/stories/molecule/MarketSelectV3';
import { BookmarkBoardV3 } from '~/stories/template/BookmarkBoardV3';
import { Footer } from '~/stories/template/Footer';
import { HeaderV3 } from '~/stories/template/HeaderV3';
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
  const { client } = useChromaticClient();
  const { onLoadBackgroundRef } = useBackgroundGradient();

  const selectedLp = useAppSelector(selectedLpSelector);
  const lpTitle = isNotNil(selectedLp)
    ? `${selectedLp.settlementToken.name}-${selectedLp.market.description}`
    : undefined;
  const price = formatDecimals(selectedLp?.price, selectedLp?.clpDecimals, 3, true);
  const marketDescription = selectedLp?.market.description;
  const tagClass = useMemo(() => {
    switch (selectedLp?.tag.toLowerCase()) {
      case 'high risk': {
        return 'tag-risk-high';
      }
      case 'mid risk': {
        return 'tag-risk-mid';
      }
      case 'low risk': {
        return 'tag-risk-low';
      }
    }
    return '';
  }, [selectedLp]);

  const lpDescription = useMemo(() => {
    switch (selectedLp?.tag.toLowerCase()) {
      case 'high risk': {
        return 'Liquidity is provided at a constant decremental rate from low to high fee bins. The lower the fee, the more liquidity is available and the more traders may use it.';
      }
      case 'mid risk': {
        return 'Liquidity is provided at a same amount from low to high fee bins. There is a constant supply of liquidity regardless of fees, so trader usage should be moderate.';
      }
      case 'low risk': {
        return 'Liquidity is provided at a constant incremental rate from low to high fee bins. The higher the fee, the more liquidity is available, which may discourage traders from using it.';
      }
    }
    return '';
  }, [selectedLp]);

  const onCLPRegister = useCallback(async () => {
    if (isNil(selectedLp)) {
      return;
    }
    const isAdded = await client.walletClient?.watchAsset({
      type: 'ERC20',
      options: {
        address: selectedLp.address,
        symbol: selectedLp.clpSymbol,
        decimals: selectedLp.clpDecimals,
      },
    });

    if (isAdded) {
      toast('New CLP token was registered.');
    } else {
      toast.error('Failed to register.');
    }
  }, [client.walletClient, selectedLp]);

  useEffect(() => {
    showCautionToast({
      title: 'Chromatic Protocol Testnet',
      titleClass: 'text-chrm',
      message:
        'During the testnet, contract updates may reset deposited assets, open positions, and liquidity data in your account.',
      showLogo: true,
    });
  }, []);

  return (
    <>
      <div id="gradient" ref={(element) => onLoadBackgroundRef(element)}>
        <div id="prev"></div>
        <div id="current"></div>
      </div>
      <div className="page-container">
        <BookmarkBoardV3 />
        <HeaderV3 />
        <main className="max-w-[1480px]">
          <MarketSelectV3 />
          <div className="flex items-stretch gap-5 mt-8">
            <div className="flex-none w-[220px]">
              <h4 className="mt-3 mb-2 text-left">Pools</h4>
              <PoolMenuV3 />
            </div>
            <div className="flex-auto mt-10">
              <div className="mb-10 text-left">
                <div className="flex items-center mb-5">
                  <SkeletonElement isLoading={isNil(lpTitle)} width={120} containerClassName="mr-3">
                    <h2 className="mr-3 text-4xl">
                      {lpTitle} {selectedLp?.name}
                    </h2>
                  </SkeletonElement>
                  <Tag label={selectedLp?.tag} className={tagClass} />
                  <Button
                    label="Metamask"
                    iconLeft={<PlusIcon className="w-3 h-3" />}
                    css="translucent"
                    className="ml-4 !pl-2 !py-1"
                    gap="1"
                    size="sm"
                    onClick={() => {
                      onCLPRegister();
                    }}
                  />
                  <div className="flex items-center gap-2 ml-auto text-xl font-semibold">
                    CLP Price
                    <SkeletonElement isLoading={isNil(selectedLp)} containerClassName="w-[120px]">
                      <Avatar
                        label={`${price} ${selectedLp?.settlementToken.name}`}
                        size="sm"
                        gap="1"
                        fontSize="2xl"
                        src={selectedLp?.settlementToken.image}
                      />
                    </SkeletonElement>
                  </div>
                </div>
                <p className="text-lg text-primary-light">{lpDescription}</p>
                {/* TODO: learn more button */}
              </div>
              <div className="flex gap-3">
                <div className="flex-auto overflow-hidden">
                  <div className="panel panel-translucent">
                    <PoolPanelV2 />
                  </div>
                  {/* TODO: Should be implemented later */}
                  {/* <div className="mt-10">
                    <PoolAnalyticsV3 />
                  </div> */}
                </div>
                <div className="flex-none w-[36%] min-w-[340px] max-w-[380px] flex flex-col gap-3">
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
                  <div className="mt-5">
                    <Button
                      to="/trade"
                      css="translucent"
                      label={
                        isNotNil(marketDescription)
                          ? `Trade on ${marketDescription} Pool`
                          : 'Loading...'
                      }
                      iconRight={<ChevronRightIcon />}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
        <Toast />
        <ChainModal />
      </div>
    </>
  );
};

export default PoolV3;
