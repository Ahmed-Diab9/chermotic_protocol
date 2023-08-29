import { AccountPopoverV2 } from '~/stories/molecule/AccountPopoverV2';
import { MarketSelectV2 } from '~/stories/molecule/MarketSelectV2';

interface MainBarV2Props {
  accountPopover?: boolean;
}

export function MainBarV2({ accountPopover = false }: MainBarV2Props) {
  return (
    <div className="relative py-2">
      <div className="flex gap-2 justify-stretch">
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
