import './style.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface ToastProps {
  message?: string;
}

export const Toast = (props: ToastProps) => {
  const { message } = props;

  const displayMsg = () => {
    toast(<Msg message={message} />);
  };

  return (
    <div>
      {import.meta.env.DEV && <button onClick={displayMsg}>click</button>}
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
        theme="colored"
      />
    </div>
  );
};

interface MsgProps {
  message?: string;
}

const Msg = (props: MsgProps) => {
  const { message } = props;

  return (
    <div className="flex">
      <InformationCircleIcon className="w-4 mr-2" />
      {message}
    </div>
  );
};
