import { ArrowTopRightOnSquareIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { isNil } from 'ramda';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePublicClient } from 'wagmi';
import { useMarket } from '~/hooks/useMarket';
import { AddressCopyButton } from '~/stories/atom/AddressCopyButton';
import { Toast } from '~/stories/atom/Toast';
import { PoolProgress } from '~/stories/container/PoolProgress';
import { trimAddress } from '~/utils/address';
import { copyText } from '~/utils/clipboard';
import { isValid } from '~/utils/valid';
import { useMarketLocal } from '../../hooks/useMarketLocal';
import { useTokenLocal } from '../../hooks/useTokenLocal';
import { Button } from '../../stories/atom/Button';
import { Outlink } from '../../stories/atom/Outlink';
import { Header } from '../../stories/container/Header';
import { PoolPanel } from '../../stories/container/PoolPanel';
import { Footer } from '../../stories/template/Footer';
import { MainBar } from '../../stories/template/MainBar';
import './style.css';

const Pool = () => {
  const { currentMarket: selectedMarket, clbTokenAddress } = useMarket();
  useTokenLocal();
  useMarketLocal();

  const publicClient = usePublicClient();
  const blockExplorer = useMemo(() => {
    try {
      const rawUrl = publicClient.chain.blockExplorers?.default?.url;
      if (isNil(rawUrl)) {
        return;
      }
      return new URL(rawUrl).origin;
    } catch (error) {
      return;
    }
  }, [publicClient]);

  return (
    <div className="flex flex-col min-h-[100vh] w-full bg-grayLbg">
      <Header />
      <section className="flex flex-col grow w-full max-w-[1200px] px-5 mx-auto mb-20">
        <MainBar showAccountPopover={false} />
        <div className="flex items-stretch gap-3">
          <div className="flex-auto w-3/5">
            <PoolPanel />
            {/* bottom */}
            <article className="p-5 mx-auto mt-5 bg-white border shadow-lg rounded-2xl">
              <div className="flex items-center justify-between w-full gap-1">
                <h4 className="font-bold">Token(ERC-1155) Contract Address</h4>
                <div className="flex gap-2">
                  <AddressCopyButton
                    address={clbTokenAddress && trimAddress(clbTokenAddress, 6, 6)}
                    onClick={() => {
                      if (clbTokenAddress) {
                        copyText(clbTokenAddress);
                      }
                    }}
                  />
                  {/* todo : outlink button link */}
                  <Button
                    href={
                      clbTokenAddress && blockExplorer
                        ? `${blockExplorer}/token/${clbTokenAddress}`
                        : undefined
                    }
                    label="view scanner"
                    css="circle"
                    size="lg"
                    iconOnly={<ArrowTopRightOnSquareIcon />}
                  />
                </div>
              </div>
              <div className="mt-3 mb-3 text-base text-left text-black/30">
                When providing liquidity to the liquidity bins of the Chromatic protocol, providers
                are rewarded by minting CLB tokens. CLB tokens follow the ERC-1155 standard and have
                one token contract per market, with each bin having its own unique token ID.{' '}
                <Outlink outLink="https://chromatic-protocol.gitbook.io/docs/tokens/clb-token-erc-1155" />
              </div>
            </article>
            <div className="mt-10">
              <Link to={'/trade'}>
                <Button
                  label={
                    isValid(selectedMarket)
                      ? `Trade on ${selectedMarket.description} Pool`
                      : 'Market loading'
                  }
                  iconRight={<ChevronRightIcon />}
                />
              </Link>
            </div>
          </div>
          <div className="w-2/5 max-w-[500px] min-w-[480px]">
            <PoolProgress />
          </div>
        </div>
      </section>
      <Footer />
      <Toast />
    </div>
  );
};

export default Pool;
