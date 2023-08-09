import Logo from '~/assets/icons/Logo';
import { Button } from '../../atom/Button';

import GitbookIcon from '~/assets/icons/GitbookIcon';
import TelegramIcon from '~/assets/icons/TelegramIcon';
import TwitterIcon from '~/assets/icons/TwitterIcon';

// interface FooterProps {
//   user?: User;
//   onLogin: () => void;
//   onLogout: () => void;
//   onCreateAccount: () => void;
// }

export const Footer = () => (
  <footer>
    <div className="flex flex-col items-center gap-4 pt-6 pb-8 text-center bg-black1 dark:border-t">
      <a href="/home" title="Chromatic">
        <Logo className="text-white1" />
      </a>
      <p className="text-white3">A New Era in Decentralized Perpetual Futures</p>
      <div className="flex items-center gap-2">
        <Button
          href="https://twitter.com/chromatic_perp"
          css="circle"
          size="lg"
          className="!bg-transparent !border-white3 !text-white1"
          iconOnly={<TwitterIcon />}
        />
        <Button
          href=""
          css="circle"
          size="lg"
          className="!bg-transparent !border-white3 !text-white1"
          iconOnly={<TelegramIcon />}
        />
        <Button
          href=""
          css="circle"
          size="lg"
          className="!bg-transparent !border-white3 !text-white1"
          iconOnly={<GitbookIcon />}
        />
      </div>
    </div>
  </footer>
);
