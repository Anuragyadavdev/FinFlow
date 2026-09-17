import { useState } from 'react';
import { FiPlus, FiDollarSign, FiTrendingUp } from 'react-icons/fi';

import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import AccountCard from '../components/feature/AccountCard';
import AccountFormModal from '../components/feature/AccountFormModal';

import {
  useAccounts,
  useDeleteAccount,
} from '../hooks/queries/useAccounts';

export default function Accounts() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const { data: accounts = [], isLoading, isError, error } = useAccounts();
  const deleteMut = useDeleteAccount();

  const total = accounts.reduce((s, a) => s + Number(a.balance || 0), 0);
  const activeCount = accounts.filter((a) => a.isActive).length;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (a) => {
    setEditing(a);
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
          <h1 className="text-2xl font-bold mb-1">Accounts</h1>
          <p className="text-sm text-gray-400">
            Manage your bank accounts, wallets, and cards
          </p>
        </div>
        <Button onClick={openCreate}>
          <FiPlus size={16} /> Add Account
        </Button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <GlassCard className="bg-gradient-to-br from-primary-500/15 to-transparent border-primary-500/20">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-primary">
              <FiDollarSign className="text-white" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">
                Total Balance
              </p>
              <p className="text-2xl font-bold text-white">
                <AnimatedNumber value={total} />
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
                Active Accounts
              </p>
              <p className="text-2xl font-bold text-white">{activeCount}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Accounts grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : isError ? (
        <GlassCard>
          <p className="text-accent-red text-sm">
            {error?.message || 'Failed to load accounts'}
          </p>
        </GlassCard>
      ) : accounts.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon="🏦"
            title="No accounts yet"
            description="Add your first account to start tracking your finances."
            action={
              <Button onClick={openCreate}>
                <FiPlus size={16} /> Add Your First Account
              </Button>
            }
          />
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {accounts.map((a, i) => (
            <AccountCard
              key={a.id}
              account={a}
              onEdit={openEdit}
              onDelete={setDeleting}
              delay={i * 0.04}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AccountFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        account={editing}
      />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteMut.isPending}
        title="Delete account?"
        message={`"${deleting?.name}" will be archived. Associated transactions stay intact.`}
      />
    </div>
  );
}