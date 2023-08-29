import { AccountPopoverV2 } from '~/stories/molecule/AccountPopoverV2';
import { MarketSelectV2 } from '~/stories/molecule/MarketSelectV2';

interface MainBarV2Props {
  accountPopover?: boolean;
}

export function MainBarV2({ accountPopover = false }: MainBarV2Props) {
  return (
    <div className="relative py-3">
      <div className="flex gap-3 justify-stretch">
        <div className="flex-auto w-3/5">
          <MarketSelectV2 />
        </div>
        {accountPopover && (
          <div className="w-2/5 max-w-[500px] min-w-[480px]">
            <AccountPopoverV2 />
          </div>
        )}
      </div>
    </div>
  );
}
