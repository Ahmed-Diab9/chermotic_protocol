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
    <div className="flex justify-between">
      <MarketSelect />
      <div className="relative flex items-center gap-4">
        {user ? (
          <>
            {/* for Trading: view Asset Balance */}
            <AssetPopover />

            {/* <div className="flex gap-2">
              <p>Asset Balance</p>
              <div className="flex items-baseline gap-1">
                <h4 className="font-bold">3,025.34</h4>
                <p className="text-sm">USDC</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button label="Deposit" />
              <Button label="Withdraw" />
            </div> */}
          </>
        ) : (
          <>{/* for Pools: empty */}</>
        )}
      </div>
    </div>
  </div>
);
