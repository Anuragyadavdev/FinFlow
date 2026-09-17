import { useMemo, useState } from 'react';
import {
  FiPlus, FiTrendingUp, FiDollarSign, FiActivity,
} from 'react-icons/fi';

import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import InvestmentCard from '../components/feature/InvestmentCard';
import InvestmentFormModal from '../components/feature/InvestmentFormModal';
import AllocationPieChart from '../components/charts/AllocationPieChart';

import {
  useInvestments,
  useDeleteInvestment,
} from '../hooks/queries/useInvestments';
import { formatCurrency } from '../utils/formatters';

export default function Investments() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const { data: investments = [], isLoading, isError, error } = useInvestments();
  const deleteMut = useDeleteInvestment();

  const totals = useMemo(() => {
    const invested = investments.reduce((s, i) => s + Number(i.investedAmount || 0), 0);
    const current = investments.reduce(
      (s, i) => s + Number(i.currentValue || i.investedAmount || 0),
      0
    );
    const pl = current - invested;
    const plPct = invested ? (pl / invested) * 100 : 0;
    return { invested, current, pl, plPct };
  }, [investments]);

  const allocation = useMemo(() => {
    const map = {};
    investments.forEach((i) => {
      const key = i.investmentType;
      map[key] = (map[key] || 0) + Number(i.currentValue || i.investedAmount || 0);
    });
    return Object.entries(map).map(([name, value]) => ({
      name: name.replace('_', ' '),
      value,
    }));
  }, [investments]);

  const isProfit = totals.pl > 0.01;
  const isLoss = totals.pl < -0.01;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (inv) => {
    setEditing(inv);
    setFormOpen(true);
  };
  const confirmDelete = () => {
    if (!deleting) return;
    deleteMut.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Investments</h1>
          <p className="text-sm text-gray-400">
            Track your portfolio and performance
          </p>
        </div>
        <Button onClick={openCreate}>
          <FiPlus size={16} /> Add Investment
        </Button>
      </div>

      {/* Summary */}
      {investments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <GlassCard className="bg-gradient-to-br from-primary-500/15 to-transparent border-primary-500/20">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-primary">
                <FiDollarSign className="text-white" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Current Value
                </p>
                <p className="text-xl font-bold text-white">
                  <AnimatedNumber value={totals.current} />
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="bg-gradient-to-br from-accent-cyan/15 to-transparent border-accent-cyan/20">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-accent-cyan/20 flex items-center justify-center">
                <FiActivity className="text-accent-cyan" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Invested
                </p>
                <p className="text-xl font-bold text-white">
                  <AnimatedNumber value={totals.invested} />
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard
            className={`bg-gradient-to-br to-transparent ${
              isProfit
                ? 'from-accent-green/15 border-accent-green/20'
                : isLoss
                ? 'from-accent-red/15 border-accent-red/20'
                : 'from-gray-500/15 border-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`h-11 w-11 rounded-xl flex items-center justify-center ${
                  isProfit
                    ? 'bg-accent-green/20'
                    : isLoss
                    ? 'bg-accent-red/20'
                    : 'bg-white/10'
                }`}
              >
                <FiTrendingUp
                  className={
                    isProfit
                      ? 'text-accent-green'
                      : isLoss
                      ? 'text-accent-red rotate-180'
                      : 'text-gray-400'
                  }
                  size={20}
                />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Total P&L
                </p>
                <p
                  className={`text-xl font-bold ${
                    isProfit
                      ? 'text-accent-green'
                      : isLoss
                      ? 'text-accent-red'
                      : 'text-white'
                  }`}
                >
                  {isProfit ? '+' : ''}
                  <AnimatedNumber value={totals.pl} />
                  <span className="text-sm ml-2">
                    ({totals.plPct >= 0 ? '+' : ''}
                    {totals.plPct.toFixed(2)}%)
                  </span>
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-52" />
          ))}
        </div>
      ) : isError ? (
        <GlassCard>
          <p className="text-accent-red text-sm">
            {error?.message || 'Failed to load investments'}
          </p>
        </GlassCard>
      ) : investments.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon="📈"
            title="No investments yet"
            description="Track your stocks, mutual funds, FD, gold, and more."
            action={
              <Button onClick={openCreate}>
                <FiPlus size={16} /> Add Your First Investment
              </Button>
            }
          />
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {investments.map((inv, i) => (
              <InvestmentCard
                key={inv.id}
                investment={inv}
                onEdit={openEdit}
                onDelete={setDeleting}
                delay={i * 0.04}
              />
            ))}
          </div>

          {/* Allocation */}
          <GlassCard className="h-fit lg:sticky lg:top-20">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Allocation
            </h3>
            <AllocationPieChart data={allocation} />
            <div className="space-y-2 mt-3">
              {allocation.map((a, i) => {
                const pct =
                  totals.current > 0 ? (a.value / totals.current) * 100 : 0;
                return (
                  <div
                    key={a.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-gray-400">{a.name}</span>
                    <span className="font-medium">{pct.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Modals */}
      <InvestmentFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        investment={editing}
      />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteMut.isPending}
        title="Remove investment?"
        message={`"${
          deleting?.companyName || deleting?.stockSymbol || 'This investment'
        }" will be removed from your portfolio.`}
      />
    </div>
  );
}