import { Input } from '~/stories/atom/Input';
import { TooltipAlert } from '~/stories/atom/TooltipAlert';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { numberFormat } from '~/utils/number';
interface AmountSwitchProps {
  collateral: string;
  quantity: string;
  method: 'quantity' | 'collateral';
  direction: 'long' | 'short';
  disabled: boolean;
  disableDetail?: 'minimum' | 'liquidity' | 'balance' | undefined;
  tokenName?: string;
  minAmount: string;
  onAmountChange: (value: string) => unknown;
}

export const AmountSwitch = (props: AmountSwitchProps) => {
  const {
    collateral,
    quantity,
    method,
    direction,
    disabled,
    disableDetail,
    tokenName,
    onAmountChange,
    minAmount,
  } = props;

  const errors = {
    balance: 'Exceeded available account balance.',
    liquidity: 'Exceeded free liquidity size.',
    minimum: `Less than minimum betting amount. (${minAmount} ${tokenName})`,
  };
  const errorMessage = disableDetail ? errors[disableDetail] : undefined;

  const presets = {
    collateral: {
      value: collateral,
      subValue: quantity,
      subLabel: 'Contract Qty',
      tooltip:
        'Contract Qty is the base unit of the trading contract when opening a position. Contract Qty = Collateral / Stop Loss.',
    },
    quantity: {
      value: quantity,
      subValue: collateral,
      subLabel: 'Collateral',
      tooltip:
        'Collateral is the amount that needs to be actually deposited as taker margin(collateral) in the trading contract to open the position.',
    },
  };
  const preset = presets[method || 'collateral'];

  return (
    <>
      <div className="max-w-[220px]">
        <div className={`tooltip-input-balance-${direction}`}>
          <Input
            value={preset.value.toString()}
            onChange={onAmountChange}
            placeholder="0"
            error={disabled && !!errorMessage}
          />
          {errorMessage && <TooltipAlert label={`input-balance-${direction}`} tip={errorMessage} />}
        </div>
      </div>
      <div className="flex items-center justify-end mt-2">
        <TooltipGuide
          label="contract-qty"
          tip={preset.tooltip}
          outLink="https://chromatic-protocol.gitbook.io/docs/trade/tp-sl-configuration"
          outLinkAbout="Payoff"
        />
        <p>{preset.subLabel}</p>
        <p className="ml-2 text-lg text-black2">
          {numberFormat(preset.subValue, { maxDigits: 5, useGrouping: true })} {tokenName}
        </p>
      </div>
    </>
  );
};
