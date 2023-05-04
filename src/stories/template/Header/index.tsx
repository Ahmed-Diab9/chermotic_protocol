import { Button } from "../../atom/Button";
import { WalletDropdown } from "../../molecule/WalletDropdown";
import "./style.css";

type User = {
  name: string;
  contract: string;
};

interface HeaderProps {
  user?: User;
  onLogin: () => void;
  onLogout: () => void;
  onCreateAccount: () => void;
}

export const Header = ({
  user,
  onLogin,
  onLogout,
  onCreateAccount,
}: HeaderProps) => (
  <header>
    <div className="flex items-center wrapper">
      <div className="flex items-center gap-6">
        <a href="/" className="font-bold">
          CHROMATIC
        </a>
        <a href="/trade">Trade</a>
        <a href="/pool">Pool</a>
        {/* dropdown */}
      </div>
      <div>
        {user ? (
          <>
            <WalletDropdown />
          </>
        ) : (
          <>
            <Button css="active" onClick={onLogin} label="Connect" />
          </>
        )}
      </div>
    </div>
  </header>
);
