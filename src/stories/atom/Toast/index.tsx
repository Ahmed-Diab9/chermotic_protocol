import React from 'react';
import './style.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ToastProps {
  message: string;
}

export const Toast = (props: ToastProps) => {
  const { message } = props;

  const displayMsg = () => toast(message);

  return (
    <div>
      <button onClick={displayMsg}>click</button>
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
