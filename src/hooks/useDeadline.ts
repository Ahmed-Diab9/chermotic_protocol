import { useEffect, useState } from "react";

// FIXME
// 유효한 Deadline을 계산할 방법을 찾아야 함
const weight = 30;
const createTimestamp = () => {
  return Math.round(Date.now() / 1000) + weight;
};

const useDeadline = () => {
  const [timestamp, setTimestamp] = useState(createTimestamp());

  useEffect(() => {
    let timerId = setTimeout(function onTimeout() {
      const nextTimestamp = createTimestamp();
      setTimestamp(nextTimestamp);

      timerId = setTimeout(onTimeout, 1000);
    }, 1000);
    return () => {
      clearTimeout(timerId);
    };
  }, []);

  return timestamp;
};

export default useDeadline;
