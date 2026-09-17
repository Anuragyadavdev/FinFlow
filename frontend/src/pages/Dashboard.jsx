import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiPercent } from 'react-icons/fi';

import { useDashboard } from '../hooks/queries/useDashboard';
import StatCard from '../components/ui/StatCard';
import GlassCard from '../components/ui/GlassCard';
import Skeleton from '../components/ui/Skeleton';
import SpendingPieChart from '../components/charts/SpendingPieChart';
import MonthlyTrendChart from '../components/charts/MonthlyTrendChart';
import SavingsLineChart from '../components/charts/SavingsLineChart';
import RecentTransactions from '../components/common/RecentTransactions';
import AiInsightCard from '../components/common/AiInsightCard';
import { formatCurrency } from '../utils/formatters';

export default function Dashboard() {
  const { data, isLoading, isError, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-32" />
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
        <p className="text-accent-red">Failed to load dashboard: {error?.message}</p>
      </GlassCard>
    );
  }

  const {
    totalBalance = 0,
    monthlyIncome = 0,
    monthlyExpenses = 0,
    savingsRate = 0,
    categorySpending = {},
    monthlyTrends = [],
    recentTransactions = [],
  } = data || {};

  const incomeChange =
    monthlyTrends.length >= 2
      ? monthlyTrends[monthlyTrends.length - 1].income -
        monthlyTrends[monthlyTrends.length - 2].income
      : 0;
  const expenseChange =
    monthlyTrends.length >= 2
      ? monthlyTrends[monthlyTrends.length - 1].expenses -
        monthlyTrends[monthlyTrends.length - 2].expenses
      : 0;

  // Build category list from map
  const categoryList = Object.entries(categorySpending).map(([name, amount]) => ({
    categoryName: name,
    amount,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-sm text-gray-400">
          Here's what's happening with your money.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Balance"
          value={totalBalance}
          icon={<FiDollarSign />}
          accent="primary"
          delay={0}
        />
        <StatCard
          title="Income (This Month)"
          value={monthlyIncome}
          change={incomeChange}
          icon={<FiTrendingUp />}
          accent="green"
          delay={0.05}
        />
        <StatCard
          title="Expenses (This Month)"
          value={monthlyExpenses}
          change={expenseChange}
          icon={<FiTrendingDown />}
          accent="red"
          delay={0.1}
        />
        <StatCard
          title="Savings Rate"
          value={savingsRate}
          prefix=""
          suffix="%"
          icon={<FiPercent />}
          accent="cyan"
          delay={0.15}
        />
      </div>

      {/* AI insight card (only if any) */}
      <AiInsightCard insights={data?.insights || []} />

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
          <SpendingPieChart data={categoryList} />
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold mb-4">Income vs Expenses (6 mo)</h3>
          <MonthlyTrendChart data={monthlyTrends} />
        </GlassCard>
      </div>

      {/* Charts row 2 + recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4">Savings Trend</h3>
          <SavingsLineChart data={monthlyTrends} />
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <span className="text-xs text-gray-500">
              {formatCurrency(monthlyExpenses)} spent this month
            </span>
          </div>
          <RecentTransactions transactions={recentTransactions} />
        </GlassCard>
      </div>
    </div>
  );
}