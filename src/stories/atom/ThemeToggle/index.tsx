import { useState, useEffect } from 'react';
import { Button } from '../Button';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import '../Button/style.css';

interface ThemeToggleProps {
  label?: string;
  className?: string;
  disabled?: boolean;
  onToggle?: (checked: boolean) => void;
}

export const ThemeToggle = (props: ThemeToggleProps) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check if 'dark' class exists on <html> element
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
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
