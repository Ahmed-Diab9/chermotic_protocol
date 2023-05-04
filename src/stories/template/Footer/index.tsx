import { Button } from "../../atom/Button";
import "./style.css";

// interface FooterProps {
//   user?: User;
//   onLogin: () => void;
//   onLogout: () => void;
//   onCreateAccount: () => void;
// }

export const Footer = () => (
  <footer>
    <div className="opacity-50 wrapper bg-black/10">
      <div className="flex items-center gap-6">
        <h1>LOGO</h1>
        <a href="/trade">Trade</a>
        <a href="/pool">Pools</a>
        <a href="">Documents</a>
        <a href="">Development</a>
        <a href="">Blog</a>
      </div>
    </div>
  </footer>
);
