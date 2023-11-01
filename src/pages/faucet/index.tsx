import { testSettlementTokenABI } from '@chromatic-protocol/sdk-viem';
import { isNil } from 'ramda';
import { toast } from 'react-toastify';
import { getContract } from 'viem';
import { useAccount } from 'wagmi';
import { arbitrumGoerli } from 'wagmi/chains';
import useBackgroundGradient from '~/hooks/useBackgroundGradient';
import { useChromaticClient } from '~/hooks/useChromaticClient';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { Button } from '~/stories/atom/Button';
import { MarketSelectV3 } from '~/stories/molecule/MarketSelectV3';
import { BookmarkBoardV3 } from '~/stories/template/BookmarkBoardV3';
import { HeaderV3 } from '~/stories/template/HeaderV3';

export const Faucet = () => {
  const { tokens } = useSettlementToken();
  const { address } = useAccount();
  const { client } = useChromaticClient();
  const { onLoadBackgroundRef } = useBackgroundGradient();
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
      <div id="gradient" ref={(element) => onLoadBackgroundRef(element)}>
        <div id="prev"></div>
        <div id="current"></div>
      </div>
      <div className="flex flex-col min-h-[100vh] min-w-[1280px] w-full relative">
        <BookmarkBoardV3 />
        <HeaderV3 />
        <section className="flex flex-col w-full px-5 mx-auto mt-8 mb-20 grow max-w-[1400px]">
          <MarketSelectV3 />
          <Button onClick={() => onFaucet()} label="Faucet" className="mt-4" />
        </section>
      </div>
    </>
  );
};
