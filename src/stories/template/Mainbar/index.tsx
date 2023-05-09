import { Button } from "../../atom/Button";
import { MarketSelect } from "../../molecule/MarketSelect";
import { AssetPopover } from "../../molecule/AssetPopover";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
// import "./style.css";

type User = {
  name: string;
  contract: string;
};

interface MainbarProps {
  user?: User;
  // onLogin: () => void;
  // onLogout: () => void;
}

export const Mainbar = ({ user }: MainbarProps) => (
  <div className="p-4">
    <div className="flex gap-5 justify-stretch">
      <MarketSelect />
      <>
        {user ? (
          <>
            {/* Trading: view Asset Balance */}
            <AssetPopover />
          </>
        ) : (
          <>{/* Pools: empty */}</>
        )}
      </>
    </div>
  </div>
);
