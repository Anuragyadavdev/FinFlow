import { useState, useMemo } from 'react';
import { FiPlus, FiTarget, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';

import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import GoalCard from '../components/feature/GoalCard';
import GoalFormModal from '../components/feature/GoalFormModal';
import GoalProgressModal from '../components/feature/GoalProgressModal';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import { formatCurrency } from '../utils/formatters';

import {
  useGoals,
  useDeleteGoal,
} from '../hooks/queries/useGoals';

export default function Goals() {
  const [tab, setTab] = useState('active');
  const [formOpen, setFormOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [progressGoal, setProgressGoal] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const { data: goals = [], isLoading, isError, error } = useGoals();
  const deleteMut = useDeleteGoal();

  const { active, completed } = useMemo(() => ({
    active: goals.filter((g) => g.status !== 'COMPLETED'),
    completed: goals.filter((g) => g.status === 'COMPLETED'),
  }), [goals]);

  const displayGoals = tab === 'active' ? active : completed;

  const totalTarget = active.reduce((s, g) => s + Number(g.targetAmount || 0), 0);
  const totalSaved = active.reduce((s, g) => s + Number(g.currentAmount || 0), 0);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (g) => {
    setEditing(g);
    setFormOpen(true);
  };
  const openProgress = (g) => {
    setProgressGoal(g);
    setProgressOpen(true);
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
          <h1 className="text-2xl font-bold mb-1">Financial Goals</h1>
          <p className="text-sm text-gray-400">
            Track your savings goals and stay motivated
          </p>
        </div>
        <Button onClick={openCreate}>
          <FiPlus size={16} /> New Goal
        </Button>
      </div>

      {/* Summary */}
      {active.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <GlassCard className="bg-gradient-to-br from-primary-500/15 to-transparent border-primary-500/20">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-primary">
                <FiTarget className="text-white" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Active Goals
                </p>
                <p className="text-2xl font-bold">{active.length}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="bg-gradient-to-br from-accent-green/15 to-transparent border-accent-green/20">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-accent-green/20 flex items-center justify-center">
                <FiCheckCircle className="text-accent-green" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Total Saved
                </p>
                <p className="text-xl font-bold text-white">
                  <AnimatedNumber value={totalSaved} />
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="bg-gradient-to-br from-accent-cyan/15 to-transparent border-accent-cyan/20">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-accent-cyan/20 flex items-center justify-center">
                <FiTrendingUp className="text-accent-cyan" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Total Target
                </p>
                <p className="text-xl font-bold text-white">
                  <AnimatedNumber value={totalTarget} />
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Tabs */}
      {goals.length > 0 && (
        <div className="flex gap-2 mb-6 p-1 rounded-xl bg-white/5 w-fit">
          {[
            { v: 'active', l: `Active (${active.length})` },
            { v: 'completed', l: `Completed (${completed.length})` },
          ].map((t) => (
            <button
              key={t.v}
              onClick={() => setTab(t.v)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
                tab === t.v
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.l}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : isError ? (
        <GlassCard>
          <p className="text-accent-red text-sm">
            {error?.message || 'Failed to load goals'}
          </p>
        </GlassCard>
      ) : displayGoals.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon="🎯"
            title={tab === 'active' ? 'No active goals' : 'No completed goals yet'}
            description={
              tab === 'active'
                ? 'Set a goal and track your progress.'
                : 'Complete goals to see them here.'
            }
            action={
              tab === 'active' ? (
                <Button onClick={openCreate}>
                  <FiPlus size={16} /> Create Your First Goal
                </Button>
              ) : null
            }
          />
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayGoals.map((g, i) => (
            <GoalCard
              key={g.id}
              goal={g}
              onEdit={openEdit}
              onDelete={setDeleting}
              onAddProgress={openProgress}
              delay={i * 0.04}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <GoalFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        goal={editing}
      />
      <GoalProgressModal
        open={progressOpen}
        onClose={() => {
          setProgressOpen(false);
          setProgressGoal(null);
        }}
        goal={progressGoal}
      />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteMut.isPending}
        title="Delete goal?"
        message={`"${deleting?.name}" and its progress will be removed.`}
      />
    </div>
  );
}