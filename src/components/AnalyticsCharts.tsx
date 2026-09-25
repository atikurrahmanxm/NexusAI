import React from 'react';
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

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  timeSeriesData,
  distributionData
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart 1: Real-time ML Anomaly Detection (2 Cols on lg) */}
      <div className="lg:col-span-2 rounded-xl border border-surface-border bg-surface-card p-5 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent-cyan" />
                <h3 className="font-semibold text-sm text-white tracking-wide uppercase font-mono">
                  Real-Time ML Anomaly Detection | Last 24H
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Dual-axis correlation: Threat Ingestion Rate vs Statistical Anomaly Score
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-purple" />
                <span className="text-slate-300">Threat Activity</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan" />
                <span className="text-slate-300">Anomaly Score</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="h-64 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
          </ResponsiveContainer>
        </div>

        <div className="mt-3 pt-3 border-t border-surface-border/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-accent-rose">
            <AlertOctagon className="w-3.5 h-3.5" />
            Peak anomaly deviation (8.8 score) identified at 14:00
          </span>
          <span>Sample Rate: 10s window</span>
        </div>
      </div>

      {/* Chart 2: Threat Distribution Breakdown (1 Col on lg) */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-accent-purple" />
            <h3 className="font-semibold text-sm text-white tracking-wide uppercase font-mono">
              Threat Vector Breakdown
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Categorical threat distribution across monitored subnets
          </p>
        </div>

        {/* Bar Chart Container */}
        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2E45" opacity={0.6} />
              <XAxis 
                dataKey="name" 
                stroke="#64748B" 
                fontSize={10} 
                tickLine={false} 
                fontFamily="JetBrains Mono"
              />
              <YAxis 
                stroke="#64748B" 
                fontSize={10} 
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
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Incidents">
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 pt-3 border-t border-surface-border/60 text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <span>Top Vector: <strong className="text-accent-purple">DDoS Flood</strong></span>
          <span className="text-accent-emerald">Mitigation: 94%</span>
        </div>
      </div>
    </div>
  );
};
