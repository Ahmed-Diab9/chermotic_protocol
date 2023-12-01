import './style.css';

interface BlurTextProps {
  label?: string;
  color?: string;
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  fontWeight?: 'lighter' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'right' | 'center';
  className?: string;
}

export const BlurText = (props: BlurTextProps) => {
  const {
    className = '',
    label,
    color = '',
    fontSize,
    fontWeight = 'light',
    align = 'left',
  } = props;

  return (
    <div className={`relative text-${align} flex`}>
      <p
        className={`${
          fontSize ? `text-${fontSize}` : `text-[70px]`
        }  text-${color} font-${fontWeight} ${className} blur-sm`}
      >
        {label}
      </p>
      <p
        className={`absolute left-0 top-0 ${
          fontSize ? `text-${fontSize}` : `text-[70px]`
        } text-${color} font-${fontWeight} ${className}`}
      >
        {label}
      </p>
    </div>
  );
};
