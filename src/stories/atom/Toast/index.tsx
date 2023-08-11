import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './style.css';

interface ToastProps {
  message?: string;
}

export const Toast = (props: ToastProps) => {
  const { message } = props;

  const displayMsg = () => {
    toast(<Msg message={message} />);
    toast.info(<Msg message={message} />);
    toast.success(<Msg message={message} />);
    toast.warning(<Msg message={message} />);
    toast.error(<Msg message={message} />);
  };

  return (
    <div>
      <button onClick={displayMsg}>click</button>
      <ToastContainer
        position="bottom-right"
        autoClose={300000}
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
  const { message } = props;

  return <div className="flex">{message}</div>;
};
