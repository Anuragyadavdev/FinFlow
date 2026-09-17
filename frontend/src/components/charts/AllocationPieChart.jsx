import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
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
      <p className="text-primary-400">{p.percent.toFixed(1)}%</p>
    </div>
  );
};

export default function AllocationPieChart({ data = [] }) {
  if (!data.length) return <EmptyState icon="🥧" title="No investments yet" />;

  const total = data.reduce((s, d) => s + d.value, 0);
  const chartData = data.map((d, i) => ({
    ...d,
    percent: total ? (d.value / total) * 100 : 0,
    color: getCategoryColor(i),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={3}
        >
          {chartData.map((e, i) => (
            <Cell key={i} fill={e.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}