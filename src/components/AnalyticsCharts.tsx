import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Activity, BarChart3, AlertOctagon } from 'lucide-react';
import { TimeSeriesDataPoint, ThreatDistributionItem } from '../types/telemetry';

interface AnalyticsChartsProps {
  timeSeriesData: TimeSeriesDataPoint[];
  distributionData: ThreatDistributionItem[];
}

type TimeRange = '1H' | '24H' | '7D' | '30D';
type ChartStyle = 'AREA' | 'VOLUME_BARS';

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  timeSeriesData,
  distributionData
}) => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('24H');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('AREA');

  // Filter or scale data based on time slicer
  const displayedTimeSeries = React.useMemo(() => {
    if (selectedRange === '1H') {
      return timeSeriesData.slice(-6);
    }
    if (selectedRange === '7D') {
      return timeSeriesData.map((d, i) => ({
        ...d,
        time: `Day ${i + 1}`,
        threatActivity: Math.min(100, d.threatActivity + 5),
        anomalyScore: parseFloat((d.anomalyScore * 0.95).toFixed(1))
      }));
    }
    if (selectedRange === '30D') {
      return timeSeriesData.map((d, i) => ({
        ...d,
        time: `W${Math.floor(i / 2) + 1}`,
        threatActivity: Math.min(100, Math.floor(d.threatActivity * 1.1)),
        anomalyScore: parseFloat((d.anomalyScore * 1.05).toFixed(1))
      }));
    }
    return timeSeriesData;
  }, [selectedRange, timeSeriesData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart 1: Real-time ML Anomaly Detection (2 Cols on lg) */}
      <div className="lg:col-span-2 rounded-2xl border border-surface-border bg-gradient-to-b from-surface-card to-surface/90 p-5 md:p-6 flex flex-col justify-between shadow-card-subtle hover:border-slate-700/80 transition-all duration-200">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-accent-cyan border border-cyan-500/20">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-white tracking-wide uppercase">
                  Real-Time ML Anomaly &amp; Volume Stream
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-accent-cyan border border-cyan-500/30 font-bold">
                  {selectedRange} WINDOW
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Dual-axis correlation: Threat Ingestion Rate vs Statistical Z-Score Outliers
              </p>
            </div>

            {/* Time Slicer & Chart Type Toggle (Design #5 Palantir Wall Style) */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Range Slicer */}
              <div className="flex items-center p-1 rounded-xl bg-surface border border-surface-border text-xs font-mono">
                {(['1H', '24H', '7D', '30D'] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setSelectedRange(range)}
                    className={`px-2.5 py-1 rounded-lg transition-all text-[11px] font-bold ${
                      selectedRange === range
                        ? 'bg-primary text-white shadow-glow-primary'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>

              {/* Chart Mode */}
              <div className="hidden sm:flex items-center p-1 rounded-xl bg-surface border border-surface-border text-xs font-mono">
                <button
                  onClick={() => setChartStyle('AREA')}
                  className={`px-2 py-1 rounded-lg transition-all text-[11px] font-bold ${
                    chartStyle === 'AREA'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Area Spline Density"
                >
                  Area
                </button>
                <button
                  onClick={() => setChartStyle('VOLUME_BARS')}
                  className={`px-2 py-1 rounded-lg transition-all text-[11px] font-bold ${
                    chartStyle === 'VOLUME_BARS'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="High-Density Candlestick / Bar Volume"
                >
                  Volume
                </button>
              </div>

              {/* Legend */}
              <div className="hidden xl:flex items-center gap-3 text-xs font-medium pl-2 border-l border-surface-border">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-purple shadow-sm shadow-purple-500/40" />
                  <span className="text-slate-300 text-[11px]">Threat Load</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan shadow-sm shadow-cyan-500/40" />
                  <span className="text-slate-300 text-[11px]">Z-Score (0-10)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="h-64 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartStyle === 'AREA' ? (
              <AreaChart data={displayedTimeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#1F2E45" opacity={0.6} />
                
                <XAxis 
                  dataKey="time" 
                  stroke="#64748B" 
                  fontSize={11} 
                  tickLine={false} 
                  fontFamily="JetBrains Mono"
                />
                <YAxis 
                  stroke="#64748B" 
                  fontSize={11} 
                  tickLine={false} 
                  fontFamily="JetBrains Mono"
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#1F2E45',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '12px',
                    color: '#F1F5F9'
                  }}
                  labelStyle={{ color: '#94A3B8', fontWeight: 'bold', marginBottom: '4px' }}
                />

                <Area
                  type="monotone"
                  dataKey="threatActivity"
                  name="Threat Events"
                  stroke="#8B5CF6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#purpleGradient)"
                />

                <Area
                  type="monotone"
                  dataKey="anomalyScore"
                  name="Anomaly Index (0-10)"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#cyanGradient)"
                />
              </AreaChart>
            ) : (
              /* Candlestick / Bar Volume View (Bloomberg Style) */
              <BarChart data={displayedTimeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2E45" opacity={0.6} />
                <XAxis 
                  dataKey="time" 
                  stroke="#64748B" 
                  fontSize={11} 
                  tickLine={false} 
                  fontFamily="JetBrains Mono"
                />
                <YAxis 
                  stroke="#64748B" 
                  fontSize={11} 
                  tickLine={false} 
                  fontFamily="JetBrains Mono"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#1F2E45',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '12px',
                    color: '#F1F5F9'
                  }}
                  labelStyle={{ color: '#94A3B8', fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Bar dataKey="threatActivity" name="Volume (Events)" radius={[4, 4, 0, 0]}>
                  {displayedTimeSeries.map((entry, index) => (
                    <Cell 
                      key={`bar-${index}`} 
                      fill={entry.threatActivity > 70 ? '#F43F5E' : entry.threatActivity > 40 ? '#8B5CF6' : '#06B6D4'} 
                    />
                  ))}
                </Bar>
                <Bar dataKey="anomalyScore" name="Anomaly Z-Score" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="mt-3 pt-3 border-t border-surface-border/60 flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-slate-400">
          <span className="flex items-center gap-1.5 text-accent-rose font-mono">
            <AlertOctagon className="w-3.5 h-3.5" />
            Peak anomaly deviation (8.8 score) identified at 14:00
          </span>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-slate-400">Resolution: <strong className="text-white">100ms</strong></span>
            <span className="text-slate-400">Inference: <strong className="text-accent-emerald">0.8ms</strong></span>
          </div>
        </div>
      </div>

      {/* Chart 2: Threat Distribution Breakdown (1 Col on lg) */}
      <div className="rounded-2xl border border-surface-border bg-gradient-to-b from-surface-card to-surface/90 p-5 md:p-6 flex flex-col justify-between shadow-card-subtle hover:border-slate-700/80 transition-all duration-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-accent-purple border border-purple-500/20">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white tracking-wide uppercase">
              Threat Vector Distribution
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Categorical threat distribution across monitored subnets
          </p>
        </div>

        {/* Bar Chart Container */}
        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2B45" opacity={0.6} />
              <XAxis 
                dataKey="name" 
                stroke="#64748B" 
                fontSize={11} 
                tickLine={false} 
                fontFamily="Inter, sans-serif"
              />
              <YAxis 
                stroke="#64748B" 
                fontSize={11} 
                tickLine={false} 
                fontFamily="Inter, sans-serif"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0D1322',
                  borderColor: '#1E2B45',
                  borderRadius: '1rem',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6)',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  color: '#F1F5F9'
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Incidents">
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 pt-3 border-t border-surface-border/60 text-xs font-medium text-slate-400 flex items-center justify-between font-mono">
          <span>Top Vector: <strong className="text-accent-purple font-semibold">DDoS Flood</strong></span>
          <span className="text-accent-emerald font-semibold">Mitigation: 94%</span>
        </div>
      </div>
    </div>
  );
};
