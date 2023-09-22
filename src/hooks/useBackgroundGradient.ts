import { useEffect, useState } from 'react';

function useBackgroundGradient(initialBeforeCondition: boolean, initialAfterCondition: boolean) {
  const [beforeCondition, setBeforeCondition] = useState(initialBeforeCondition);
  const [afterCondition, setAfterCondition] = useState(initialAfterCondition);

  const toggleBeforeCondition = () => {
    setBeforeCondition(!beforeCondition);
  };

  const toggleAfterCondition = () => {
    setAfterCondition(!afterCondition);
  };

  useEffect(() => {
    const test = document.getElementById('gradient');
    if (!test) return;

    if (test) {
      if (beforeCondition && afterCondition) {
        test.style.background = 'rgb(var(--color-price-higher-light) / 0.19)';
      } else if (beforeCondition) {
        test.style.background =
          'linear-gradient(90deg, rgb(var(--color-price-higher-light) / 0.19) 0%, rgb(var(--color-price-lower-light) / 0.19) 100%)';
      } else if (afterCondition) {
        test.style.background =
          'linear-gradient(90deg, rgb(var(--color-price-lower-light) / 0.19) 0%, rgb(var(--color-price-higher-light) / 0.19) 100%)';
      } else {
        test.style.background = 'rgb(var(--color-price-lower-light) / 0.19)';
      }
    }
  }, [beforeCondition, afterCondition]);

  return { beforeCondition, toggleBeforeCondition, afterCondition, toggleAfterCondition };
}

export default useBackgroundGradient;
