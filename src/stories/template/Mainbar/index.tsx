import { Button } from "../../atom/Button";
import { MarketSelect } from "../../molecule/MarketSelect";
import { AssetPopover } from "../../molecule/AssetPopover";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
// import "./style.css";

type User = {
  name: string;
  contract: string;
};

interface MainBarProps {
  user?: User;
  // onLogin: () => void;
  // onLogout: () => void;
}

export const MainBar = ({ user }: MainBarProps) => (
  <div className="p-4">
    <div className="flex gap-5 justify-stretch">
      <MarketSelect />
      <AssetPopover />
    </div>
  </div>
);
