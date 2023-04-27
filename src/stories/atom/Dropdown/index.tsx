import { Menu } from "@headlessui/react";
import "./style.css";

interface DropdownProps {
  label: string;
  size?: "sm" | "base" | "lg";
  align?: "left" | "center" | "right";
  onClick?: () => void;
}

export const Dropdown = ({
  label,
  size = "base",
  align = "left",
  ...props
}: DropdownProps) => {
  return (
    <div className={`dropdown text-${align}`}>
      <Menu>
        <Menu.Button>{label}</Menu.Button>
        <Menu.Items>
          <Menu.Item>
            {({ active }) => (
              <a
                className={`${active && "bg-active"}`}
                href="/account-settings"
              >
                Menu Item 01
              </a>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <a
                className={`${active && "bg-active"}`}
                href="/account-settings"
              >
                Menu Item 02
              </a>
            )}
          </Menu.Item>
          <Menu.Item disabled>
            <span className="opacity-50">Disabled</span>
          </Menu.Item>
        </Menu.Items>
      </Menu>
    </div>
  );
};
