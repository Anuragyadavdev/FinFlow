import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiEdit2, FiTrash2,
  FiArrowUpRight, FiArrowDownLeft, FiRepeat, FiChevronLeft, FiChevronRight,
} from 'react-icons/fi';

import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import TransactionFormModal from '../components/feature/TransactionFormModal';
import TransactionFilters from '../components/feature/TransactionFilters';

import {
  useTransactions,
  useDeleteTransaction,
} from '../hooks/queries/useTransactions';
import { formatCurrency, formatDateTime } from '../utils/formatters';

const typeStyle = {
  INCOME:  { Icon: FiArrowDownLeft, cls: 'text-accent-green bg-accent-green/10' },
  EXPENSE: { Icon: FiArrowUpRight,  cls: 'text-accent-red bg-accent-red/10' },
  TRANSFER:{ Icon: FiRepeat,        cls: 'text-primary-400 bg-primary-500/10' },
};

export default function Transactions() {
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [filters, setFilters] = useState({
    sortBy: 'transactionDate',
    sortDir: 'desc',
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const params = useMemo(
    () => ({ page, size, ...filters }),
    [page, size, filters]
  );

  const { data, isLoading, isError, error } = useTransactions(params);
  const deleteMut = useDeleteTransaction();

  const transactions = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const total = data?.totalElements || 0;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (txn) => {
    setEditing(txn);
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
          <h1 className="text-2xl font-bold mb-1">Transactions</h1>
          <p className="text-sm text-gray-400">
            {total} transaction{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button onClick={openCreate}>
          <FiPlus size={16} /> Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <TransactionFilters
        filters={filters}
        onChange={(f) => {
          setFilters(f);
          setPage(0);
        }}
        onReset={() => {
          setFilters({ sortBy: 'transactionDate', sortDir: 'desc' });
          setPage(0);
        }}
      />

      {/* Table / List */}
      <GlassCard className="!p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-6 text-accent-red text-sm">
            {error?.message || 'Failed to load transactions'}
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No transactions found"
            description="Start by adding your first transaction."
            action={
              <Button onClick={openCreate}>
                <FiPlus size={16} /> Add Transaction
              </Button>
            }
          />
        ) : (
          <>
            {/* Desktop table header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">Description</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Account</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>

            {/* Rows */}
            <AnimatePresence>
              {transactions.map((t, i) => {
                const { Icon, cls } = typeStyle[t.type] || typeStyle.EXPENSE;
                const isIncome = t.type === 'INCOME';
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="group grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/5 transition"
                  >
                    {/* Description + icon */}
                    <div className="md:col-span-4 flex items-center gap-3 min-w-0">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cls}`}>
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {t.description || t.merchantName || 'Transaction'}
                        </p>
                        {t.isAnomaly && (
                          <Badge variant="amber" className="mt-1">⚠ Unusual</Badge>
                        )}
                      </div>
                    </div>

                    {/* Category */}
                    <div className="md:col-span-2 text-sm text-gray-400 truncate">
                      {t.categoryName || '—'}
                    </div>

                    {/* Account */}
                    <div className="md:col-span-2 text-sm text-gray-400 truncate">
                      {t.accountName || '—'}
                      {t.toAccountName && (
                        <span className="text-xs text-gray-500"> → {t.toAccountName}</span>
                      )}
                    </div>

                    {/* Date */}
                    <div className="md:col-span-2 text-sm text-gray-400 truncate">
                      {formatDateTime(t.transactionDate)}
                    </div>

                    {/* Amount + actions */}
                    <div className="md:col-span-2 flex md:justify-end items-center gap-3">
                      <span
                        className={`text-sm font-semibold ${
                          isIncome ? 'text-accent-green' : 'text-accent-red'
                        }`}
                      >
                        {isIncome ? '+' : '−'} {formatCurrency(t.amount)}
                      </span>
                      <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition">
                        <button
                          onClick={() => openEdit(t)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white transition"
                          title="Edit"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleting(t)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-accent-red/10 hover:text-accent-red transition"
                          title="Delete"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </>
        )}
      </GlassCard>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <p className="text-xs text-gray-400">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <FiChevronLeft size={16} /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Next <FiChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <TransactionFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        transaction={editing}
      />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteMut.isPending}
        title="Delete transaction?"
        message={`This will permanently delete "${
          deleting?.description || 'this transaction'
        }". Your account balance will be restored.`}
      />
    </div>
  );
}