import { Button } from "../../atom/Button";
import { MarketSelect } from "../../molecule/MarketSelect";
import "./style.css";

type User = {
  name: string;
  contract: string;
};

interface MainbarProps {
  user?: User;
  onLogin: () => void;
  onLogout: () => void;
  onCreateAccount: () => void;
}

export const Mainbar = ({
  user,
  onLogin,
  onLogout,
  onCreateAccount,
}: MainbarProps) => (
  <div className="p-4">
    <div className="relative flex justify-between">
      <div className="flex items-center gap-6">
        {/* dropdown */}
        <MarketSelect label="" />
        <div className="flex items-center gap-4">
          <h2 className="text-2xl">$1,542.07</h2>
          {/* divider */}
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-1">
              <p>Interest Rate</p>
              <Button label="info" size="xs" />
            </div>
            <h4>0.0036%/h</h4>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            {/* login */}
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
          <>{/* logout */}</>
        )}
      </div>
    </div>
  </div>
);
