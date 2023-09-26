import { AccountPopoverV3 } from '~/stories/molecule/AccountPopoverV3';
import { MarketSelectV3 } from '~/stories/molecule/MarketSelectV3';
import './style.css';

interface MainBarV3Props {
  accountPopover?: boolean;
}

export function MainBarV3({ accountPopover = false }: MainBarV3Props) {
  return (
    <div className="relative mb-8 MainBarV3 border-primary/10">
      {/* <div className="backdrop backdrop-light" /> */}
      <div className="flex gap-3 justify-stretch">
        <div className="flex-auto w-full">
          <MarketSelectV3 />
        </div>
        {accountPopover && (
          <div className="w-[480px] flex-none">
            <AccountPopoverV3 />
          </div>
        )}
      </div>
    </div>
  );
}
