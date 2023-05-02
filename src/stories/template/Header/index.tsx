import { Button } from "../../atom/Button";
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
    <div className="wrapper">
      <div className="flex items-center gap-6">
        <h1>LOGO</h1>
        <a href="/trade">Trade</a>
        <a href="/pool">Pool</a>
        {/* dropdown */}
      </div>
      <div>
        {user ? (
          <>
            {/* <Button onClick={onLogin} label="Connect" /> */}
            {/* wallet dropdown */}
            {/* <Button size="sm" onClick={onLogout} label="Log out" /> */}
          </>
        ) : (
          <>
            <Button active onClick={onLogin} label="Connect" />
            {/* <Button size="sm" onClick={onCreateAccount} label="Sign up" /> */}
          </>
        )}
      </div>
    </div>
  </header>
);
