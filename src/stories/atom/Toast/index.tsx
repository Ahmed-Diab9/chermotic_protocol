import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './style.css';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface ToastProps {
  message?: string;
  icon?: React.ReactNode;
}

export const Toast = (props: ToastProps) => {
  const { message, icon } = props;

  const displayMsg = () => {
    toast(<Msg message={message} icon={icon} />);
  };

  return (
    <div>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

interface MsgProps {
  message?: string;
  icon?: React.ReactNode;
}

const Msg = (props: MsgProps) => {
  const { message, icon } = props;

  return (
    <div className="flex">
      <InformationCircleIcon className="w-4 mr-2 text-primary-lighter" />
      {message}
    </div>
  );
};
