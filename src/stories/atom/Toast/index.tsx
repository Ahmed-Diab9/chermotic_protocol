import { ToastContainer, toast } from 'react-toastify';
import { ChromaticRowLogo } from '~/assets/icons/Logo';

import 'react-toastify/dist/ReactToastify.css';
import './style.css';

interface ToastProps {
  title?: string;
  message?: string;
  autoclose?: false | number;
  showLogo?: boolean;
  titleClass?: string;
  showTest?: boolean;
}

export const Toast = (props: ToastProps) => {
  const {
    title,
    message,
    autoclose = 3000,
    showLogo = false,
    titleClass,
    showTest = false,
  } = props;

  const displayMsg = () => {
    toast(<Msg message={message} title={title} titleClass={titleClass} showLogo={showLogo} />);
    // toast.info(<Msg message={message} />);
    // toast.success(<Msg message={message} />);
    // toast.warning(<Msg message={message} />);
    // toast.error(<Msg message={message} />);
  };

  return (
    <div>
      {showTest && <button onClick={displayMsg}>click</button>}
      <ToastContainer
        position="bottom-right"
        autoClose={autoclose}
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
  title?: string;
  message?: string;
  titleClass?: string;
  showLogo?: boolean;
}

const Msg = (props: MsgProps) => {
  const { title, message, titleClass, showLogo = false } = props;

  return (
    <div className="flex flex-col items-start gap-2">
      {title && <h4 className={`text-sm ${titleClass}`}>{title}</h4>}
      <p className="text-sm">{message}</p>
      {showLogo && (
        <div className="mt-2 text-primary-light">
          <ChromaticRowLogo />
        </div>
      )}
    </div>
  );
};

export const showCautionToast = (props: MsgProps) => {
  toast(<Msg {...props} />, {
    autoClose: false,
    closeButton: true,
    closeOnClick: false,
  });
};
