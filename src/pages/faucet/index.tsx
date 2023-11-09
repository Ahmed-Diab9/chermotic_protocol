import { isNil } from 'ramda';
import { useAccount } from 'wagmi';
import { OutlinkIcon } from '~/assets/icons/Icon';
import { useBlockExplorer } from '~/hooks/useBlockExplorer';
import { useFaucet } from '~/hooks/useFaucet';
import { Avatar } from '~/stories/atom/Avatar';
import { Button } from '~/stories/atom/Button';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { HeaderV3 } from '~/stories/template/HeaderV3';

const Faucet = () => {
  const {
    allowedTokens,
    buttonStates,
    isLoading: isTokenLoading,
    currentChain,
    onFaucetClick,
  } = useFaucet({
    allowedTokens: ['cBTC', 'cETH'],
  });
  const { address } = useAccount();
  const isLoading = isTokenLoading || isNil(buttonStates);
  const blockExplorer = useBlockExplorer({
    address,
    path: 'address',
  });

  return (
    <>
      <div className="page-container bg-gradient-chrm">
        <HeaderV3 hideMenu />
        {/* <Button onClick={() => onFaucet()} label="Faucet" className="mt-4" /> */}
        <main>
          <section className="text-left panel panel-translucent w-full max-w-[800px] py-10 mx-auto my-20">
            <div className="px-10 mb-10">
              <div className="flex items-baseline gap-3 mb-2">
                <h2 className="text-[60px]">Faucet</h2>
                <h4 className="text-2xl">for Chromatic Protocol Testnet on Arbitrum Goerli</h4>
              </div>
              <div className="flex items-center gap-2 mb-8">
                <p className="text-lg text-primary-light">
                  cETH and cBTC are isolated test tokens used only for the Chromatic protocol
                  testnet. <br />
                  Please note that they are not pegged to any assets such as ETH, BTC, wETH, or
                  wBTC.
                </p>
              </div>
              <div className="relative flex items-center gap-4 px-5 py-3 overflow-hidden border rounded-xl bg-paper-lighter">
                <p className="text-xl text-primary-light">Target Address</p>
                <div className="text-xl w-[calc(100%-200px)] overflow-hidden overflow-ellipsis text-left">
                  {address}
                </div>
                <Button
                  iconOnly={<OutlinkIcon />}
                  className="ml-auto"
                  css="unstyled"
                  href={blockExplorer}
                />
              </div>
            </div>
            <article>
              <SkeletonElement isLoading={isLoading} containerClassName="flex px-10 h-[40px]">
                {allowedTokens?.map((allowedToken) => (
                  <div
                    key={`${allowedToken.address}-${allowedToken.name}`}
                    className="flex items-center gap-3 px-10 py-6 border-t last:border-b"
                  >
                    <Avatar size="2xl" />
                    <div>
                      <h2 className="text-2xl">{allowedToken.name}</h2>
                      <p className="mt-1 text-primary-light">{currentChain.name}</p>
                    </div>
                    <Button
                      onClick={() => onFaucetClick(allowedToken.name)}
                      label={buttonStates?.[allowedToken.name].label}
                      className="ml-auto"
                      css="active"
                      size="xl"
                      disabled={isLoading || !buttonStates?.[allowedToken.name].isActive}
                    />
                  </div>
                ))}
              </SkeletonElement>
            </article>
            <div className="px-10 mt-10">
              <p className="text-lg text-primary-light">
                You can obtain 100 cETH or 100 cBTC at once. After receiving it, it will be
                available again after 24 hours.
              </p>
            </div>
          </section>
        </main>
        {/* <Footer /> */}
      </div>
    </>
  );
};

export default Faucet;
