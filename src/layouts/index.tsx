import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import useBookmarksUpdate from '~/hooks/updates/useBookmarksUpdate';
import useMarketsUpdate from '~/hooks/updates/useMarketsUpdate';
import useBackgroundGradient from '~/hooks/useBackgroundGradient';
import { subscribePythFeed } from '~/lib/pyth/subscribe';
import { Toast, showCautionToast } from '~/stories/atom/Toast';
import { ChainModal } from '~/stories/container/ChainModal';
import { BookmarkBoardV3 } from '~/stories/template/BookmarkBoardV3';
import { Footer } from '~/stories/template/Footer';
import { HeaderV3 } from '~/stories/template/HeaderV3';

export const ChromaticLayout = () => {
  const location = useLocation();
  const [isLoaded, setIsLoaded] = useState({
    page: false,
    toast: false,
  });
  useEffect(() => {
    setIsLoaded((state) => ({
      ...state,
      page: true,
    }));
  }, []);
  useMarketsUpdate();
  useEffect(() => {
    if (!isLoaded.page || isLoaded.toast) {
      return;
    }
    switch (location.pathname) {
      case '/pools':
      case '/trade': {
        showCautionToast({
          title: 'Chromatic Protocol Testnet',
          titleClass: 'text-chrm',
          message:
            'During the testnet, contract updates may reset deposited assets, open positions, and liquidity data in your account.',
          showLogo: true,
        });
        setIsLoaded((state) => ({
          ...state,
          toast: true,
        }));
        break;
      }
      default: {
        break;
      }
    }
  }, [isLoaded, location]);

  const isAirdrop = location.pathname === '/airdrop';
  const classes = useMemo(() => {
    switch (location.pathname) {
      case '/trade': {
        return { container: '!min-w-[1360px]', main: '' };
      }
      case '/pools': {
        return { container: '', main: 'max-w-[1480px]' };
      }
      case '/airdrop': {
        return { container: 'bg-gradient-chrm', main: 'max-w-[1400px]' };
      }
      case '/referral': {
        return { container: 'bg-gradient-chrm', main: 'max-w-[1280px]' };
      }
    }
  }, [location.pathname]);
  return (
    <div className={`page-container ${classes?.container}`}>
      {!isAirdrop && <BookmarkBoardV3 />}
      <HeaderV3 />
      <main className={classes?.main}>
        <Outlet />
      </main>
      <Footer />
      <Toast />
      <ChainModal />
    </div>
  );
};

export const GradientLayout = () => {
  const { onLoadBackgroundRef } = useBackgroundGradient();
  useBookmarksUpdate();

  useEffect(() => {
    const unsubscriber = subscribePythFeed();
    return () => {
      unsubscriber();
    };
  }, []);

  return (
    <>
      <div id="gradient" ref={(element) => onLoadBackgroundRef(element)}>
        <div id="prev"></div>
        <div id="current"></div>
      </div>
      <Outlet />
    </>
  );
};
