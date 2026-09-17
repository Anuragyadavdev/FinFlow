import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { getCategoryColor } from '../../utils/colors';
import EmptyState from '../ui/EmptyState';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value, payload: p } = payload[0];
  return (
    <div className="glass-card px-3 py-2 text-xs">
      <p className="font-medium">{name}</p>
      <p className="text-gray-400">{formatCurrency(value)}</p>
      {p?.percentage != null && (
        <p className="text-primary-400">{p.percentage.toFixed(1)}%</p>
      )}
    </div>
  );
};

export default function SpendingPieChart({ data = [] }) {
  if (!data.length) {
    return (
      <EmptyState
        icon="🥧"
        title="No spending yet"
        description="Add transactions to see your category breakdown."
      />
    );
  }

  const chartData = data.slice(0, 8).map((c, i) => ({
    name: c.categoryName || 'Uncategorized',
    value: Number(c.amount || 0),
    percentage: c.percentage,
    color: getCategoryColor(i),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
          animationDuration={800}
        >
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          wrapperStyle={{ fontSize: 12, color: '#9CA3AF' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}