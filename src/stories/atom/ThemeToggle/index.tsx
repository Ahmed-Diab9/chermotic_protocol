import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';
import useLocalStorage from '~/hooks/useLocalStorage';
import { Button } from '../Button';
import '../Button/style.css';

interface ThemeToggleProps {
  label?: string;
  className?: string;
  disabled?: boolean;
  onToggle?: (checked: boolean) => void;
}

export const ThemeToggle = (props: ThemeToggleProps) => {
  const { state: darkMode, setState: setDarkMode } = useLocalStorage('app:useDarkMode', false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Button
      className={`!w-[42px] !h-[42px] text-primary-light bg-gray-lighter ${darkMode ? '' : ''}`}
      css="circle"
      onClick={toggleTheme}
      iconOnly={darkMode ? <SunIcon /> : <MoonIcon />}
    />
  );
};
