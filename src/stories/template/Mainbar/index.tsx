import { MarketSelect } from "../../molecule/MarketSelect";
import { AssetPopover } from "../../molecule/AssetPopover";

// interface MainBarProps {
// onLogin: () => void;
// onLogout: () => void;
// }

export const MainBar = () => (
  <div className="z-30 px-10 py-5">
    <div className="flex gap-5 justify-stretch">
      <MarketSelect />
      <AssetPopover />
    </div>
  </div>
);
