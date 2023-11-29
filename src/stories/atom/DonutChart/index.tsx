import './style.css';

interface DonutChartProps {
  value: number;
  width: number;
  color?: string;
  bgColor?: string;
  animate?: boolean;
  className?: string;
}

export default function DonutChart(props: DonutChartProps) {
  const { value, width, color, bgColor, animate, className } = props;
  const chartStyles = {
    '--p': value,
    '--w': width + 'px',
    '--c': color,
  } as React.CSSProperties;
  const chartStylesBg = {
    '--w': width + 'px',
    '--c': bgColor,
  } as React.CSSProperties;

  return (
    <div className={`DonutChart ${className}`}>
      <div className="relative">
        <div className="pie pie-bg" style={chartStylesBg} />
        <div className={`pie ${animate ? 'animate' : ''}`} style={chartStyles} />
      </div>
      {/* {value} */}
    </div>
  );
}
