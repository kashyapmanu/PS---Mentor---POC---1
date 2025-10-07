import React, { useState } from 'react';

type DataPoint = { x: Date; y: number };
type Series = { id: string; data: DataPoint[] };

interface LineChartProps {
  series: Series[];
}

export const LineChart: React.FC<LineChartProps> = ({ series }) => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: DataPoint; seriesId: string } | null>(null);

  const width = 600;
  const height = 300;
  const margin = { top: 20, right: 20, bottom: 50, left: 30 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const allData = series.flatMap(s => s.data);
  if (allData.length === 0) return null;

  const xMin = allData[0].x;
  const xMax = allData[allData.length - 1].x;
  
  const yMin = 0;
  const yMax = 10;

  const xScale = (x: Date) => margin.left + ((x.getTime() - xMin.getTime()) / (xMax.getTime() - xMin.getTime() || 1)) * innerWidth;
  const yScale = (y: number) => margin.top + innerHeight - ((y - yMin) / (yMax - yMin)) * innerHeight;

  const colors = ['#818cf8', '#60a5fa', '#a78bfa', '#f87171'];

  const handleMouseMove = (e: React.MouseEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = e.clientX - rect.left;
    
    // Find closest point
    let closestPoint: { dist: number; point: DataPoint; seriesId: string, x: number, y: number} | null = null;

    series.forEach(s => {
        s.data.forEach(p => {
            const pointX = xScale(p.x);
            const dist = Math.abs(svgX - pointX);
            if (!closestPoint || dist < closestPoint.dist) {
                closestPoint = { dist, point: p, seriesId: s.id, x: pointX, y: yScale(p.y) };
            }
        });
    });

    if (closestPoint && closestPoint.dist < 20) { // threshold
        setTooltip({x: closestPoint.x, y: closestPoint.y, data: closestPoint.point, seriesId: closestPoint.seriesId });
    } else {
        setTooltip(null);
    }
  };

  return (
    <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} onMouseLeave={() => setTooltip(null)}>
            {/* Y Axis */}
            <g className="text-xs fill-gray-400">
                {[...Array(6)].map((_, i) => {
                    const y = yMin + i * 2;
                    return (
                        <g key={i} transform={`translate(0, ${yScale(y)})`}>
                            <line x1={margin.left} x2={width - margin.right} className="stroke-gray-700/50" strokeDasharray="2,2"/>
                            <text x={margin.left - 8} dy="0.32em" textAnchor="end">{y}</text>
                        </g>
                    );
                })}
            </g>

            {/* X Axis */}
             <g className="text-xs fill-gray-400">
                {series[0]?.data.map((d, i) => {
                    const x = xScale(d.x);
                    return (
                        <g key={i} transform={`translate(${x}, 0)`}>
                            <text y={height - margin.bottom + 20} textAnchor="middle">
                                {d.x.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </text>
                        </g>
                    )
                })}
             </g>

            {/* Lines */}
            {series.map((s, i) => (
                <path
                    key={s.id}
                    d={s.data.map((d, j) => `${j === 0 ? 'M' : 'L'}${xScale(d.x)},${yScale(d.y)}`).join(' ')}
                    fill="none"
                    stroke={colors[i % colors.length]}
                    strokeWidth="2"
                    className="transition-opacity duration-200"
                    style={{ opacity: !tooltip || tooltip.seriesId === s.id ? 1 : 0.3 }}
                />
            ))}
            
            <rect 
                x={margin.left}
                y={margin.top}
                width={innerWidth}
                height={innerHeight}
                fill="transparent"
                onMouseMove={handleMouseMove}
            />

            {/* Tooltip */}
            {tooltip && (
                <g transform={`translate(${tooltip.x}, ${tooltip.y})`}>
                    <circle r="5" fill={colors[series.findIndex(s => s.id === tooltip.seriesId) % colors.length]} className="stroke-gray-900" strokeWidth="2" />
                </g>
            )}
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
            {series.map((s, i) => (
                <div key={s.id} className="flex items-center text-sm text-gray-300">
                    <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: colors[i % colors.length]}}/>
                    {s.id}
                </div>
            ))}
        </div>

        {/* Tooltip HTML */}
        {tooltip && (
            <div 
                className="absolute p-2 text-xs text-white bg-gray-800 border border-gray-600 rounded-md shadow-lg pointer-events-none transition-transform duration-100"
                style={{
                    left: `${tooltip.x}px`,
                    top: `${tooltip.y}px`,
                    transform: `translate(-50%, -120%)`,
                }}
            >
                <div className="font-bold">{tooltip.seriesId}</div>
                <div>Rating: {tooltip.data.y}</div>
                <div className="text-gray-400">{tooltip.data.x.toLocaleDateString()}</div>
            </div>
        )}
    </div>
  );
};
