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
import { isEmpty } from 'ramda';

import { CategoricalChartState } from 'recharts/types/chart/generateCategoricalChart';

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

  const [tooltipData, setTooltipData] = useState<CategoricalChartState>({});

  const domain = ([min, max]: [number, number]) => {
    const gap = (max - min) * 0.7;
    return [min - gap, max + gap] as [number, number];
  };

  const dateFormat = (dateObject: Date) =>
    dateObject.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
    });

  const toggleActiveLine = (key: string) => () => {
    let updatedActiveLines: string[];
    if (activeLines.includes(key)) {
      updatedActiveLines = activeLines.filter((line) => line !== key);
      if (updatedActiveLines.length === 0) return;
    } else {
      updatedActiveLines = activeLines.concat(key);
    }
    setActiveLines(updatedActiveLines);
  };

  const CustomLegend = (): ReactNode => (
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
          <div
            key={key}
            onClick={toggleActiveLine(key)}
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
      })}
    </div>
  );

  const CustomTooltip = (): ReactNode => {
    const date = tooltipData.activeLabel && dateFormat(new Date(tooltipData.activeLabel));
    const payload = tooltipData.activePayload ? tooltipData.activePayload.reverse() : [];
    return (
      <div className="wrapper-tooltip">
        <div className={`tooltip tooltip-outline min-w-[200px] `}>
          <div>
            <p className="font-semibold text-primary">{date}</p>
            <div className="flex flex-col gap-1 mt-2 text-sm font-semibold text-primary-lighter">
              {payload.map(({ name, color, value }) => (
                <p style={{ color: color }}>
                  {map[name].name}: {value}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // TODO: @dia-nn empty case
  if (isEmpty(data)) {
    return (
      <ResponsiveContainer width={'100%'} height={300}>
        <>EMPTY</>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width={'100%'} height={300}>
      <ComposedChart data={data} onMouseMove={setTooltipData}>
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
        <XAxis dataKey={x} tickFormatter={dateFormat} axisLine={false} stroke="#4A4A51" />
        <YAxis scale="log" domain={domain} stroke="#4A4A51" />
        <Tooltip
          cursor={{ stroke: 'null' }}
          isAnimationActive={false}
          offset={10}
          active={true}
          content={CustomTooltip}
        />
        <Legend content={CustomLegend} />
        {Object.keys(map)
          .map((key, idx) => {
            const props = {
              dot: false,
              isAnimationActive: false,
              key: key,
              dataKey: key,
              stroke: COLORS[idx],
              fill: `url(#area_${idx})`,
              activeDot: { stroke: COLORS[idx], width: 1, height: 1, strokeWidth: 0.1 },
              hide: !activeLines.includes(key),
            };
            return map[key].type === 'area' ? <Area {...props} /> : <Line {...props} />;
          })
          .sort((a) => (a.type.displayName === 'Line' ? 0 : -1))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
