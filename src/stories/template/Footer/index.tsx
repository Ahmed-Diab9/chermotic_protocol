import Logo from '~/assets/icons/Logo';
import { Button } from '../../atom/Button';

import gitbookIcon from '/src/assets/images/gitbook.svg';
import telegramIcon from '/src/assets/images/telegram.svg';
import twitterIcon from '/src/assets/images/twitter.svg';

// interface FooterProps {
//   user?: User;
//   onLogin: () => void;
//   onLogout: () => void;
//   onCreateAccount: () => void;
// }

export const Footer = () => (
  <footer>
    <div className="flex flex-col items-center gap-4 pt-6 pb-8 text-center bg-black">
      <a href="/home" title="Chromatic">
        <Logo className="text-white" />
      </a>
      <p className="text-white/30">Redesigning Future of Derivative Markets</p>
      <div className="flex items-center gap-2">
        <Button
          css="circle"
          size="lg"
          className="!bg-transparent !border-white/30"
          iconOnly={<img src={twitterIcon} alt="twitter" />}
        />
        <Button
          css="circle"
          size="lg"
          className="!bg-transparent !border-white/30"
          iconOnly={<img src={telegramIcon} alt="telegram" />}
        />
        <Button
          css="circle"
          size="lg"
          className="!bg-transparent !border-white/30"
          iconOnly={<img src={gitbookIcon} alt="gitbook" />}
        />
      </div>
    </div>
  </footer>
);
