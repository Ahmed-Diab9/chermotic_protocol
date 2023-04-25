import { useState } from "react";
import { Listbox } from "@headlessui/react";
import "./style.css";

interface SelectProps {
  label: string;
  size?: "sm" | "md" | "lg";
  align?: "left" | "center" | "right";
  onClick?: () => void;
}

const listitem = [
  { id: 1, title: "select default", unavailable: false },
  { id: 2, title: "select 02", unavailable: false },
  { id: 3, title: "select 03", unavailable: false },
  { id: 4, title: "select 04 disabled", unavailable: true },
  { id: 5, title: "select 05", unavailable: false },
];

export const Select = ({
  label,
  size = "md",
  align = "left",
  ...props
}: SelectProps) => {
  const [selectedItem, setSelectedItem] = useState(listitem[0]);

  return (
    <div className={`select text-${align}`}>
      <Listbox value={selectedItem} onChange={setSelectedItem}>
        <Listbox.Button>{selectedItem.title}</Listbox.Button>
        <Listbox.Options>
          {listitem.map((item) => (
            <Listbox.Option
              key={item.id}
              value={item}
              disabled={item.unavailable}
            >
              {item.title}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>
    </div>
  );
};
