import { Tab } from "@headlessui/react";
import "./style.css";

interface TabsProps {
  onClick?: () => void;
}

export const Tabs = (props: TabsProps) => {
  return (
    <div className="tabs">
      <Tab.Group>
        <Tab.List>
          <Tab>Tab 1</Tab>
          <Tab>Tab 2</Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>Content 1</Tab.Panel>
          <Tab.Panel>Content 2</Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};
