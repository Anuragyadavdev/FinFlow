import { useState } from 'react';
import { FiPlus, FiPieChart, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import BudgetCard from '../components/feature/BudgetCard';
import BudgetFormModal from '../components/feature/BudgetFormModal';
import AnimatedNumber from '../components/ui/AnimatedNumber';

import {
  useBudgets,
  useDeleteBudget,
} from '../hooks/queries/useBudgets';

export default function Budgets() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const { data: budgets = [], isLoading, isError, error } = useBudgets();
  const deleteMut = useDeleteBudget();

  const active = budgets.filter((b) => b.isActive);
  const overBudget = active.filter((b) => b.isExceeded);
  const nearLimit = active.filter(
    (b) => !b.isExceeded && (b.percentageUsed ?? 0) >= (b.alertThreshold ?? 80)
  );
  const onTrack = active.length - overBudget.length - nearLimit.length;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (b) => {
    setEditing(b);
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
          <h1 className="text-2xl font-bold mb-1">Budgets</h1>
          <p className="text-sm text-gray-400">
            Set limits and track your spending
          </p>
        </div>
        <Button onClick={openCreate}>
          <FiPlus size={16} /> New Budget
        </Button>
      </div>

      {/* Summary */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <SummaryCard
            icon={<FiCheckCircle />}
            label="On Track"
            value={onTrack}
            accent="green"
          />
          <SummaryCard
            icon={<FiAlertTriangle />}
            label="Near Limit"
            value={nearLimit.length}
            accent="amber"
          />
          <SummaryCard
            icon={<FiAlertTriangle />}
            label="Exceeded"
            value={overBudget.length}
            accent="red"
          />
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : isError ? (
        <GlassCard>
          <p className="text-accent-red text-sm">
            {error?.message || 'Failed to load budgets'}
          </p>
        </GlassCard>
      ) : budgets.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon="📊"
            title="No budgets yet"
            description="Set your first budget and get alerts when you approach the limit."
            action={
              <Button onClick={openCreate}>
                <FiPlus size={16} /> Create Budget
              </Button>
            }
          />
        </GlassCard>
      ) : (
        <div className="space-y-8">
          {overBudget.length > 0 && (
            <Section title="⚠ Exceeded" accent="red">
              {overBudget.map((b, i) => (
                <BudgetCard
                  key={b.id}
                  budget={b}
                  onEdit={openEdit}
                  onDelete={setDeleting}
                  delay={i * 0.04}
                />
              ))}
            </Section>
          )}

          {nearLimit.length > 0 && (
            <Section title="⚡ Near Limit" accent="amber">
              {nearLimit.map((b, i) => (
                <BudgetCard
                  key={b.id}
                  budget={b}
                  onEdit={openEdit}
                  onDelete={setDeleting}
                  delay={i * 0.04}
                />
              ))}
            </Section>
          )}

          {onTrack > 0 && (
            <Section title="✓ On Track">
              {active
                .filter(
                  (b) =>
                    !b.isExceeded &&
                    (b.percentageUsed ?? 0) < (b.alertThreshold ?? 80)
                )
                .map((b, i) => (
                  <BudgetCard
                    key={b.id}
                    budget={b}
                    onEdit={openEdit}
                    onDelete={setDeleting}
                    delay={i * 0.04}
                  />
                ))}
            </Section>
          )}
        </div>
      )}

      {/* Modals */}
      <BudgetFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        budget={editing}
      />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteMut.isPending}
        title="Delete budget?"
        message={`"${deleting?.categoryName}" budget will be removed.`}
      />
    </div>
  );
}

/* -------------------- Helpers -------------------- */

function SummaryCard({ icon, label, value, accent }) {
  const colors = {
    green: 'from-accent-green/15 border-accent-green/20 text-accent-green',
    amber: 'from-accent-amber/15 border-accent-amber/20 text-accent-amber',
    red: 'from-accent-red/15 border-accent-red/20 text-accent-red',
  };
  return (
    <GlassCard className={`bg-gradient-to-br to-transparent ${colors[accent]}`}>
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center ${colors[accent].split(' ').pop()}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </GlassCard>
  );
}

function Section({ title, children, accent }) {
  return (
    <section>
      <h2
        className={`text-sm font-semibold uppercase tracking-wider mb-3 ${
          accent === 'red'
            ? 'text-accent-red'
            : accent === 'amber'
            ? 'text-accent-amber'
            : 'text-gray-400'
        }`}
      >
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {children}
      </div>
    </section>
  );
}