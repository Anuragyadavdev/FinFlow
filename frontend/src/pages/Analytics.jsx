import { useState } from 'react';
import {
  FiActivity, FiTrendingUp, FiTrendingDown, FiAlertTriangle,
  FiInfo, FiCheckCircle,
} from 'react-icons/fi';

import GlassCard from '../components/ui/GlassCard';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import MonthlyTrendChart from '../components/charts/MonthlyTrendChart';
import SpendingPieChart from '../components/charts/SpendingPieChart';
import SavingsLineChart from '../components/charts/SavingsLineChart';
import { useAnalytics } from '../hooks/queries/useAnalytics';
import { formatCurrency, formatPercent } from '../utils/formatters';

const RANGES = [
  { value: 3, label: '3M' },
  { value: 6, label: '6M' },
  { value: 12, label: '1Y' },
];

export default function Analytics() {
  const [months, setMonths] = useState(6);
  const { data, isLoading, isError, error } = useAnalytics(months);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <GlassCard>
        <p className="text-accent-red text-sm">
          {error?.message || 'Failed to load analytics'}
        </p>
      </GlassCard>
    );
  }

  const {
    totalIncome = 0, totalExpense = 0, netSavings = 0, savingsRate = 0,
    averageDailySpend = 0, averageTransactionAmount = 0, totalTransactions = 0,
    topExpenseCategories = [], monthlyTrends = [],
    periodComparison = {}, categoryChanges = [], insights = [],
  } = data || {};

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold mb-1">Analytics</h1>
          <p className="text-sm text-gray-400">
            Deep dive into your spending patterns
          </p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-white/5">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setMonths(r.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                months === r.value
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI title="Total Income" value={totalIncome} accent="green" icon={<FiTrendingUp />} />
        <KPI title="Total Expenses" value={totalExpense} accent="red" icon={<FiTrendingDown />} />
        <KPI title="Net Savings" value={netSavings} accent="primary" icon={<FiCheckCircle />} />
        <KPI title="Savings Rate" value={savingsRate} suffix="%" accent="cyan" icon={<FiActivity />} noCurrency />
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <GlassCard>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            💡 Insights
          </h3>
          <div className="space-y-3">
            {insights.map((ins, i) => (
              <InsightRow key={i} insight={ins} />
            ))}
          </div>
        </GlassCard>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
          <MonthlyTrendChart data={monthlyTrends} />
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold mb-4">Top Categories</h3>
          <SpendingPieChart data={topExpenseCategories} />
        </GlassCard>
      </div>

      <GlassCard>
        <h3 className="text-lg font-semibold mb-4">Savings Trend</h3>
        <SavingsLineChart data={monthlyTrends} />
      </GlassCard>

      {/* Category changes */}
      {categoryChanges.length > 0 && (
        <GlassCard>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Category Changes (vs Previous Period)
          </h3>
          <div className="space-y-2">
            {categoryChanges.slice(0, 8).map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition"
              >
                <span className="text-xl">{c.categoryIcon || '📦'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.categoryName}</p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(c.previousAmount)} → {formatCurrency(c.currentAmount)}
                  </p>
                </div>
                <div
                  className={`text-sm font-semibold ${
                    c.direction === 'INCREASED'
                      ? 'text-accent-red'
                      : c.direction === 'DECREASED'
                      ? 'text-accent-green'
                      : 'text-gray-400'
                  }`}
                >
                  {formatPercent(c.changePercent)}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Extra stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Avg Daily Spend
          </p>
          <p className="text-xl font-bold">
            <AnimatedNumber value={averageDailySpend} />
          </p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Avg Transaction
          </p>
          <p className="text-xl font-bold">
            <AnimatedNumber value={averageTransactionAmount} />
          </p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Total Transactions
          </p>
          <p className="text-xl font-bold">{totalTransactions}</p>
        </GlassCard>
      </div>
    </div>
  );
}

function KPI({ title, value, suffix = '', accent, icon, noCurrency }) {
  const colors = {
    green: 'from-accent-green/15 border-accent-green/20 text-accent-green',
    red: 'from-accent-red/15 border-accent-red/20 text-accent-red',
    primary: 'from-primary-500/15 border-primary-500/20 text-primary-400',
    cyan: 'from-accent-cyan/15 border-accent-cyan/20 text-accent-cyan',
  };
  return (
    <GlassCard className={`bg-gradient-to-br to-transparent ${colors[accent]}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-400 uppercase tracking-wider">{title}</p>
        <span className={colors[accent].split(' ').pop()}>{icon}</span>
      </div>
      <p className="text-xl font-bold text-white">
        {!noCurrency && '₹'}
        <AnimatedNumber value={Number(value)} format={noCurrency ? 'number' : 'currency'} />
        {suffix && <span className="text-sm text-gray-400 ml-1">{suffix}</span>}
      </p>
    </GlassCard>
  );
}

function InsightRow({ insight }) {
  const styles = {
    WARNING: { color: 'text-accent-amber', icon: FiAlertTriangle, bg: 'bg-accent-amber/5 border-accent-amber/20' },
    POSITIVE: { color: 'text-accent-green', icon: FiCheckCircle, bg: 'bg-accent-green/5 border-accent-green/20' },
    TREND: { color: 'text-primary-400', icon: FiTrendingUp, bg: 'bg-primary-500/5 border-primary-500/20' },
    INFO: { color: 'text-accent-cyan', icon: FiInfo, bg: 'bg-accent-cyan/5 border-accent-cyan/20' },
  };
  const s = styles[insight.type] || styles.INFO;
  const Icon = s.icon;

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${s.bg}`}>
      <Icon className={`${s.color} mt-0.5 flex-shrink-0`} size={16} />
      <div className="flex-1">
        <p className={`text-sm font-semibold ${s.color}`}>{insight.title}</p>
        <p className="text-sm text-gray-300 mt-0.5 leading-relaxed">{insight.message}</p>
      </div>
    </div>
  );
}