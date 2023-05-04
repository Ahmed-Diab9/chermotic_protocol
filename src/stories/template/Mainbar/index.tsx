import { Button } from "../../atom/Button";
import { MarketSelect } from "../../molecule/MarketSelect";
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
    <div className="relative flex justify-between">
      <div className="flex items-center gap-6">
        <MarketSelect label="" />
        <div className="flex items-center gap-4">
          <h2 className="text-2xl">$1,542.07</h2>
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-1">
              <p>Interest Rate</p>
              {/* tooltip */}
              <Button
                size="xs"
                css="noline"
                iconOnly={<InformationCircleIcon />}
              />
            </div>
            <h4>0.0036%/h</h4>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            {/* for Trading: view Asset Balance */}
            <div className="flex gap-2">
              <p>Asset Balance</p>
              <div className="flex items-baseline gap-1">
                <h4 className="font-bold">3,025.34</h4>
                <p className="text-sm">USDC</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button label="Deposit" />
              <Button label="Withdraw" />
            </div>
          </>
        ) : (
          <>{/* for Pools: empty */}</>
        )}
      </div>
    </div>
  </div>
);
