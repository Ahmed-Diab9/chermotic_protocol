import { Input } from '~/stories/atom/Input';
import { TooltipAlert } from '~/stories/atom/TooltipAlert';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { Token } from '~/typings/market';
import { TradeInput } from '~/typings/trade';
import { decimalLength, formatDecimals, withComma } from '~/utils/number';
import { isValid } from '~/utils/valid';

interface AmountSwitchProps {
  input?: TradeInput;
  token?: Token;
  disabled?: {
    status: boolean;
    detail?: 'minimum' | 'liquidity' | 'balance' | undefined;
  };
  onAmountChange?: (value: string) => unknown;
}

export const AmountSwitch = (props: AmountSwitchProps) => {
  const { input, onAmountChange, token, disabled } = props;
  if (!isValid(input) || !isValid(onAmountChange)) {
    return <></>;
  }

  const minimumAmount = formatDecimals(token?.minimumMargin, token?.decimals);
  const errors = {
    balance: 'Exceeded available account balance.',
    liquidity: 'Exceeded free liquidity size.',
    minimum: `Less than minimum betting amount. (${minimumAmount} ${token?.name})`,
  };
  const errorMessage = disabled?.detail ? errors[disabled.detail] : undefined;

  const presets = {
    collateral: {
      value: input.collateral,
      subValue: input.quantity,
      subLabel: 'Contract Qty',
      tooltip:
        'Contract Qty is the base unit of the trading contract when opening a position. Contract Qty = Collateral / Stop Loss.',
    },
    quantity: {
      value: input.quantity,
      subValue: input.collateral,
      subLabel: 'Collateral',
      tooltip:
        'Collateral is the amount that needs to be actually deposited as taker margin(collateral) in the trading contract to open the position.',
    },
  };
  const preset = presets[input?.method || 'collateral'];

  return (
    <>
      <div className="max-w-[220px]">
        <div className={`tooltip-input-balance-${input.direction}`}>
          <Input
            value={preset.value.toString()}
            onChange={onAmountChange}
            placeholder="0"
            error={disabled?.status && !!errorMessage}
          />
          {errorMessage && (
            <TooltipAlert label={`input-balance-${input.direction}`} tip={errorMessage} />
          )}
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
          {withComma(Number(decimalLength(preset.subValue, 5)))} {token?.name}
        </p>
      </div>
    </>
  );
};
