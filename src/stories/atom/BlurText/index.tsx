import './style.css';

interface BlurTextProps {
  label?: string;
  color?: string;
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  fontWeight?: 'lighter' | 'normal' | 'medium' | 'semibold' | 'bold';
  blurSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  align?: 'left' | 'right' | 'center';
  className?: string;
}

export const BlurText = (props: BlurTextProps) => {
  const {
    className = '',
    label,
    color = '',
    fontSize = '2xl',
    fontWeight = 'semibold',
    blurSize = 'sm',
    align = 'left',
  } = props;

  return (
    <div className={`relative text-${align} flex`}>
      <p
        className={`text-${fontSize} text-${color} font-${fontWeight} ${className} blur-${blurSize}`}
      >
        {label}
      </p>
      <p
        className={`absolute left-0 top-0 text-${fontSize} text-${color} font-${fontWeight} ${className}`}
      >
        {label}
      </p>
    </div>
  );
};
