import { useEffect, useState } from 'react';

function useBackgroundGradient(initialCondition: boolean) {
  const [condition, setCondition] = useState(initialCondition);

  const toggleCondition = () => {
    setCondition(!condition);
  };

  useEffect(() => {
    if (condition) {
      document.body.style.background = 'linear-gradient(to right, red, green)';
    } else {
      document.body.style.background = 'linear-gradient(to right, green, red)';
    }
  }, [condition]);

  return { condition, toggleCondition };
}

export default useBackgroundGradient;
