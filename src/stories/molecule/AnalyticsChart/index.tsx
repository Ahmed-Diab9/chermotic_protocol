import { ReactNode, useState } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from 'recharts';

type ChartType = 'line' | 'area';

export type ChartMap = {
  [key: string]: {
    name: string;
    description?: string;
    type: ChartType;
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
  const xTick = (dateObject: Date) => {
    const date = dateObject.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return date;
  };

  return (
    <ResponsiveContainer width={'100%'} height={300}>
      <ComposedChart data={data}>
        <defs>
          <linearGradient id="area_0" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6F644D" stopOpacity={1} />
            <stop offset="100%" stopColor="#837455" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="area_1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6F644D" stopOpacity={1} />
            <stop offset="100%" stopColor="#837455" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#4A4A51" />
        <XAxis dataKey={x} tickFormatter={xTick} axisLine={false} stroke="#4A4A51" />
        <Legend content={CustomLegend} />
        {Object.keys(map)
          .map((key, idx) =>
            map[key].type === 'area' ? (
              <Area
                dot={false}
                isAnimationActive={false}
                key={key}
                dataKey={key}
                stroke={COLORS[idx]}
                fill={`url(#area_${idx})`}
                activeDot={false}
                hide={!activeLines.includes(key)}
              />
            ) : (
          <Line
                dot={false}
                isAnimationActive={false}
            key={key}
            dataKey={key}
            stroke={COLORS[idx]}
                activeDot={false}
            hide={!activeLines.includes(key)}
          />
            )
          )
          .sort((a) => (a.type.displayName === 'Line' ? 0 : -1))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
