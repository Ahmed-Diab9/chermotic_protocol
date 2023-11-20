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
  showToggle?: boolean;
}

export const ThemeToggle = (props: ThemeToggleProps) => {
  const { showToggle = true } = props;
  const { state: darkMode, setState: setDarkMode } = useLocalStorage('app:useDarkMode', true);

  const forceDarkMode = true;
  const isDarkMode = forceDarkMode || darkMode;

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  if (showToggle) {
    return (
      <Button
        className={`!w-[42px] !h-[42px] text-primary-light bg-gray-lighter`}
        css="light"
        onClick={toggleTheme}
        iconOnly={darkMode ? <SunIcon /> : <MoonIcon />}
      />
    );
  }
};
