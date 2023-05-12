import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "../../atom/Button";
import "./style.css";

interface ModalProps {
  label: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

export const Modal = ({ label, size = "md", ...props }: ModalProps) => {
  let [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`modal `}>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <Dialog.Panel>
          <Dialog.Title>Deactivate account</Dialog.Title>
          <Dialog.Description>
            This will permanently deactivate your account
          </Dialog.Description>

          <p>
            Are you sure you want to deactivate your account? All of your data
            will be permanently removed. This action cannot be undone.
          </p>

          <Button label="Confirm" />
          <Button label="Cancle" />
        </Dialog.Panel>
      </Dialog>
    </div>
  );
};
