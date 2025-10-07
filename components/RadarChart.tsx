import React from 'react';

interface RadarChartProps {
  data: { axis: string; value: number }[]; // value should be 0-1
}

export const RadarChart: React.FC<RadarChartProps> = ({ data }) => {
  const size = 250;
  const center = size / 2;
  const numLevels = 5;
  const radius = center * 0.8;
  const angleSlice = (Math.PI * 2) / data.length;

  if (data.length < 3) return <p className="text-gray-500">Need at least 3 skills to draw chart.</p>;

  // Points for the chart shape
  const points = data.map((d, i) => {
    const r = radius * d.value;
    const x = center + r * Math.cos(angleSlice * i - Math.PI / 2);
    const y = center + r * Math.sin(angleSlice * i - Math.PI / 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
      <g>
        {/* Concentric Polygons (Web) */}
        {[...Array(numLevels)].map((_, levelIndex) => {
          const levelFactor = radius * ((levelIndex + 1) / numLevels);
          const levelPoints = data.map((_, i) => {
            const x = center + levelFactor * Math.cos(angleSlice * i - Math.PI / 2);
            const y = center + levelFactor * Math.sin(angleSlice * i - Math.PI / 2);
            return `${x},${y}`;
          }).join(' ');

          return (
            <polygon
              key={levelIndex}
              points={levelPoints}
              className="stroke-gray-700"
              fill="none"
              strokeWidth="1"
            />
          );
        })}

        {/* Axis lines */}
        {data.map((_, i) => {
          const x = center + radius * Math.cos(angleSlice * i - Math.PI / 2);
          const y = center + radius * Math.sin(angleSlice * i - Math.PI / 2);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              className="stroke-gray-700"
              strokeWidth="1"
            />
          );
        })}

        {/* Data Shape */}
        <polygon
          points={points}
          className="stroke-indigo-400 fill-indigo-500/30"
          strokeWidth="2"
        />
        
         {/* Data points */}
        {data.map((d, i) => {
            const r = radius * d.value;
            const x = center + r * Math.cos(angleSlice * i - Math.PI / 2);
            const y = center + r * Math.sin(angleSlice * i - Math.PI / 2);
            return (
                <circle key={i} cx={x} cy={y} r="3" className="fill-indigo-300" />
            );
        })}

        {/* Axis Labels */}
        {data.map((d, i) => {
          const labelFactor = 1.15;
          const x = center + radius * labelFactor * Math.cos(angleSlice * i - Math.PI / 2);
          const y = center + radius * labelFactor * Math.sin(angleSlice * i - Math.PI / 2);
          
          // FIX: Explicitly type `textAnchor` to satisfy the SVGTextElement's `textAnchor` prop type.
          let textAnchor: "middle" | "end" | "start" = 'middle';
          if (x < center - 1) textAnchor = 'end';
          else if (x > center + 1) textAnchor = 'start';

          return (
            <text
              key={i}
              x={x}
              y={y}
              dy="0.35em"
              className="text-xs fill-gray-400 font-semibold"
              textAnchor={textAnchor}
            >
              {d.axis}
            </text>
          );
        })}
      </g>
    </svg>
  );
};
