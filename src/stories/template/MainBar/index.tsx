import { AccountPopover } from '../../container/AccountPopover';
import { MarketSelect } from '~/stories/molecule/MarketSelect';

interface MainBarProps {
  accountPopover?: boolean;
}

export function MainBar({ accountPopover = false }: MainBarProps) {
  return (
    <div className="relative py-3">
      <div className="flex gap-3 justify-stretch">
        <div className="flex-auto w-3/5">
          <MarketSelect />
        </div>
        {accountPopover && (
          <div className="w-2/5 max-w-[500px] min-w-[480px]">
            <AccountPopover />
          </div>
        )}
      </div>
    </div>
  );
}
