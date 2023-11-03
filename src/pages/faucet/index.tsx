import { testSettlementTokenABI } from '@chromatic-protocol/sdk-viem';
import { isNil } from 'ramda';
import { toast } from 'react-toastify';
import { getContract } from 'viem';
import { useAccount } from 'wagmi';
import { arbitrumGoerli } from 'wagmi/chains';
import { useChromaticClient } from '~/hooks/useChromaticClient';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { Button } from '~/stories/atom/Button';
import { HeaderV3 } from '~/stories/template/HeaderV3';
import { Footer } from '~/stories/template/Footer';
import OutlinkIcon from '~/assets/icons/OutlinkIcon';
import { Avatar } from '~/stories/atom/Avatar';

export const Faucet = () => {
  const { tokens } = useSettlementToken();
  const { address } = useAccount();
  const { client } = useChromaticClient();
  const onFaucet = async () => {
    try {
      if (isNil(client.walletClient)) {
        return;
      }
      const cTST = tokens?.find((token) => token.name === 'cETH');
      if (isNil(tokens) || isNil(cTST)) {
        return;
      }
      if (isNil(address)) {
        return;
      }
      const contract = getContract({
        abi: testSettlementTokenABI,
        address: cTST!.address,
        publicClient: client.publicClient,
        walletClient: client.walletClient,
      });
      const { request } = await contract.simulate.faucet({
        account: address,
        chain: arbitrumGoerli,
      });

      const hash = await client.walletClient?.writeContract(request);
      await client.publicClient?.waitForTransactionReceipt({ hash });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(error);
      }
      toast.error('Invalid faucet');
    }
  };

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
                  cBTC are exclusive test tokens used on the Chromatic protocol testnet. <br />
                  They are stand-alone tokens and are not linked to ETH, BTC, wETH, or wBTC
                </p>
              </div>
              <div className="relative flex items-center gap-4 px-5 py-3 overflow-hidden border rounded-xl bg-paper-lighter">
                <p className="text-xl text-primary-light">Target Address</p>
                <div className="text-xl w-[calc(100%-200px)] overflow-hidden overflow-ellipsis text-left">
                  0x255d6457C8E4072e4B300c783Af891f674614E55
                </div>
                <Button iconOnly={<OutlinkIcon />} className="ml-auto" css="unstyled" />
              </div>
            </div>
            <div className="flex items-center gap-3 px-10 py-6 border-t">
              <Avatar size="2xl" />
              <div>
                <h2 className="text-2xl">cETH</h2>
                <p className="mt-1 text-primary-light">Arbitrum Goerli</p>
              </div>
              <Button
                // onClick={() => onFaucet()}
                label="Request 100cETH"
                className="ml-auto"
                css="active"
                size="xl"
              />
            </div>
            <div className="flex items-center gap-3 px-10 py-6 border-y">
              <Avatar size="2xl" />
              <div>
                <h2 className="text-2xl">cBTC</h2>
                <p className="mt-1 text-primary-light">Arbitrum Goerli</p>
              </div>
              <Button
                // onClick={() => onFaucet()}
                label="Request 100cBTC"
                className="ml-auto"
                css="active"
                size="xl"
              />
            </div>
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
