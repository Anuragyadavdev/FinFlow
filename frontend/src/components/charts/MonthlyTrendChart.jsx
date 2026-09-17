import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
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

export default function MonthlyTrendChart({ data = [] }) {
  if (!data.length) {
    return (
      <EmptyState
        icon="📊"
        title="No trends yet"
        description="Add transactions across months to see trends."
      />
    );
  }

  const chartData = data.map((t) => ({
    month: t.monthName,
    Income: Number(t.income || 0),
    Expenses: Number(t.expenses || 0),
    Savings: Number(t.savings || 0),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} barGap={6}>
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
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Legend wrapperStyle={{ fontSize: 12, color: '#9CA3AF' }} />
        <Bar dataKey="Income"   fill="#22C55E" radius={[6, 6, 0, 0]} />
        <Bar dataKey="Expenses" fill="#EF4444" radius={[6, 6, 0, 0]} />
        <Bar dataKey="Savings"  fill="#6C63FF" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}