import { Button } from "../../atom/Button";
import "./style.css";

type User = {
  name: string;
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
            <span className="welcome">
              Welcome, <b>{user.name}</b>!
            </span>
            {/* wallet dropdown */}
            {/* <Button size="sm" onClick={onLogout} label="Log out" /> */}
          </>
        ) : (
          <>
            <Button active size="sm" onClick={onLogin} label="Connect" />
            {/* <Button size="sm" onClick={onCreateAccount} label="Sign up" /> */}
          </>
        )}
      </div>
    </div>
  </header>
);
