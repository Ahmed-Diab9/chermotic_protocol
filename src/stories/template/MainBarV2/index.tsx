import { AccountPopoverV2 } from '~/stories/molecule/AccountPopoverV2';
import { MarketSelectV2 } from '~/stories/molecule/MarketSelectV2';
import './style.css';

interface MainBarV2Props {
  accountPopover?: boolean;
}

export function MainBarV2({ accountPopover = false }: MainBarV2Props) {
  return (
    <div className="relative py-3 MainBarV2">
      <div className="backdrop backdrop-light" />
      <div className="flex gap-3 justify-stretch">
        <div className="flex-auto w-full">
          <MarketSelectV2 />
        </div>
        {accountPopover && (
          <div className="w-[480px] flex-none">
            <AccountPopoverV2 />
          </div>
        )}
      </div>
    </div>
  );
}
