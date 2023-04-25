import { Tab } from "@headlessui/react";
import "./style.css";

interface TabsProps {
  label: string;
  size?: "sm" | "md" | "lg";
  align?: "left" | "center" | "right";
  onClick?: () => void;
}

export const Tabs = ({
  label,
  size = "md",
  align = "left",
  ...props
}: TabsProps) => {
  return (
    <div className={`tabs text-${align}`}>
      <Tab.Group>
        <Tab.List>
          <Tab>Tab 1</Tab>
          <Tab>Tab 2</Tab>
          <Tab>Tab 3</Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>Content 1</Tab.Panel>
          <Tab.Panel>Content 2</Tab.Panel>
          <Tab.Panel>Content 3</Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};
