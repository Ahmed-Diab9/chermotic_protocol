import { Avatar } from "../../atom/Avatar";
import { Button } from "../../atom/Button";
import LogoSimple from "~/assets/icons/LogoSimple";
import { WalletPopover } from "../../molecule/WalletPopover";

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
    <div className="h-[100px] px-10 py-5 flex items-center justify-between">
      <div className="flex items-center gap-12 text-lg">
        <a href="/" className="mr-4 font-bold" title="Chromatic">
          <LogoSimple />
        </a>
        <a href="/trade">Trade</a>
        <a href="/pool">Pool</a>
        {/* dropdown */}
      </div>
      <div>
        {user ? (
          <>
            <WalletPopover />
          </>
        ) : (
          <>
            <button
              onClick={onLogin}
              title="connect"
              className="p-[2px] pr-5 border rounded-full bg-black border-grayL text-white min-w-[175px]"
            >
              <Avatar
                src="/src/assets/images/arbitrum.svg"
                label="Connect"
                size="lg"
                fontSize="lg"
                fontWeight="normal"
                gap="5"
              />
            </button>
          </>
        )}
      </div>
    </div>
  </header>
);
