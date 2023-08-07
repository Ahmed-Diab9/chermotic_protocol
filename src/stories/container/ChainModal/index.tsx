import { useChainListener } from '~/hooks/useChainListener';
import { useSwitchChain } from '~/hooks/useSwitchChain';
import { Modal } from '~/stories/template/Modal';

export const ChainModal = () => {
  const { isSameChain } = useChainListener();
  const { onChainSwitch } = useSwitchChain();

  return (
    !isSameChain && (
      <Modal
        title="Wrong Network"
        paragraph="Please set network to Arbitrum"
        subParagraph="Check your wallet and sign to change network."
        buttonLabel="Try Again"
        buttonCss="gray"
        onClick={() => {
          onChainSwitch();
        }}
      />
    )
  );
};
