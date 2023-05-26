import { Menu } from "@headlessui/react";
import "./style.css";

interface DropdownProps {
  onClick?: () => void;
}

export const Dropdown = (props: DropdownProps) => {
  return (
    <div className="dropdown">
      <Menu>
        <Menu.Button>dropdown</Menu.Button>
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
