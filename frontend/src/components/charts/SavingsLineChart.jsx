import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { formatCompact } from '../../utils/formatters';
import EmptyState from '../ui/EmptyState';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: {formatCompact(entry.value)}
        </p>
      ))}
    </div>
  );
};

export default function SavingsLineChart({ data = [] }) {
  if (!data.length) {
    return (
      <EmptyState icon="📈" title="No savings data yet" />
    );
  }

  const chartData = data.map((t) => ({
    month: t.monthName,
    Savings: Number(t.savings || 0),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6C63FF" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#6C63FF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="month"
          stroke="#6B7280"
          tick={{ fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          stroke="#6B7280"
          tick={{ fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatCompact(v)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="Savings"
          stroke="#6C63FF"
          strokeWidth={2.5}
          fill="url(#savingsGradient)"
          animationDuration={900}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}