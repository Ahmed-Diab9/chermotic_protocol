import { useChain } from '~/hooks/useChain';

import { Modal } from '~/stories/template/Modal';

export const ChainModal = () => {
  const { isWrongChain, switchChain } = useChain();

  return (
    isWrongChain && (
      <Modal
        title="Wrong Network"
        paragraph="Please set network to Arbitrum"
        subParagraph="Check your wallet and sign to change network."
        buttonLabel="Try Again"
        buttonCss="default"
        onClick={switchChain}
      />
    )
  );
};
