import { ReactNode, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Props as LegendProps } from 'recharts/types/component/DefaultLegendContent';

export type ChartMap = {
  [key: string]: {
    name: string;
    description?: string;
  };
};

export type ChartData = {
  [key: string]: string | number | Date;
}[];

interface AnalyticsChartProps {
  x: string;
  map: ChartMap;
  data: ChartData;
}

const COLORS = ['#978FED', '#FBDE9D'];
const LINE_CONFIG = {
  dot: <></>,
  isAnimationActive: false,
};

export function AnalyticsChart({ data, map, x }: AnalyticsChartProps) {
  const [activeLines, setActiveLines] = useState(Object.keys(map));

  const toggleActiveLine = (key: string) => () => {
    let updatedActiveLines: string[];
    if (activeLines.includes(key)) {
      updatedActiveLines = activeLines.filter((line) => line !== key);
    } else {
      updatedActiveLines = activeLines.concat(key);
    }
    setActiveLines(updatedActiveLines);
  };

  function CustomLegend() {
    function LegendItem({
      color,
      name,
      description,
      onClick,
    }: {
      color: string;
      name: string;
      description?: string;
      onClick: () => void;
    }) {
      return (
        <div
          onClick={onClick}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <div style={{ backgroundColor: color, width: 35, height: 8, borderRadius: 4 }}></div>
          <div>
            <span>{name}</span>
            <span style={{ color: '#4A4A51' }}>{description}</span>
          </div>
        </div>
      );
    }

    return (
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}
      >
        {Object.keys(map).map((key, idx) => {
          const name = map[key].name;
          const description = map[key].description;
          const color = COLORS[idx];
          return (
          <LegendItem
              key={key}
              name={name}
              description={description}
            color={color!}
              onClick={toggleActiveLine(key)}
          />
          );
        })}
      </div>
    ) as ReactNode;
  }

  return (
    <ResponsiveContainer width={'100%'} height={500}>
      <LineChart data={data}>
        <CartesianGrid />
        <XAxis dataKey={x} />
        <YAxis />
        <Tooltip />
        <Legend content={CustomLegend} />
        {Object.keys(map).map((key, idx) => (
          <Line
            {...LINE_CONFIG}
            key={key}
            dataKey={key}
            stroke={COLORS[idx]}
            hide={!activeLines.includes(key)}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
