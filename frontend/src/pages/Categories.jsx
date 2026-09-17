import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiLock } from 'react-icons/fi';

import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import CategoryFormModal from '../components/feature/CategoryFormModal';

import {
  useCategories,
  useDeleteCategory,
} from '../hooks/queries/useCategories';

export default function Categories() {
  const [tab, setTab] = useState('EXPENSE');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const { data: categories = [], isLoading, isError, error } = useCategories(tab);
  const deleteMut = useDeleteCategory();

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (c) => {
    setEditing(c);
    setFormOpen(true);
  };
  const confirmDelete = () => {
    if (!deleting) return;
    deleteMut.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
  };

  const defaults = categories.filter((c) => c.isDefault);
  const custom = categories.filter((c) => !c.isDefault);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Categories</h1>
          <p className="text-sm text-gray-400">
            Organize your transactions by category
          </p>
        </div>
        <Button onClick={openCreate}>
          <FiPlus size={16} /> New Category
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 rounded-xl bg-white/5 w-fit">
        {[
          { v: 'EXPENSE', l: 'Expense', c: 'text-accent-red' },
          { v: 'INCOME', l: 'Income', c: 'text-accent-green' },
        ].map((t) => (
          <button
            key={t.v}
            onClick={() => setTab(t.v)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.v
                ? `bg-white/10 ${t.c}`
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.l}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : isError ? (
        <GlassCard>
          <p className="text-accent-red text-sm">
            {error?.message || 'Failed to load categories'}
          </p>
        </GlassCard>
      ) : categories.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon="🏷️"
            title="No categories yet"
            description="Create your first custom category."
            action={
              <Button onClick={openCreate}>
                <FiPlus size={16} /> Add Category
              </Button>
            }
          />
        </GlassCard>
      ) : (
        <div className="space-y-8">
          {/* Default categories */}
          {defaults.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FiLock size={12} /> Default Categories
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {defaults.map((c, i) => (
                  <CategoryChip
                    key={c.id}
                    category={c}
                    index={i}
                    readonly
                  />
                ))}
              </div>
            </section>
          )}

          {/* Custom categories */}
          {custom.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Custom Categories
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {custom.map((c, i) => (
                  <CategoryChip
                    key={c.id}
                    category={c}
                    index={i}
                    onEdit={openEdit}
                    onDelete={setDeleting}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Modals */}
      <CategoryFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        category={editing}
        defaultType={tab}
      />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteMut.isPending}
        title="Delete category?"
        message={`"${deleting?.name}" will be deleted. Transactions will remain but lose their category.`}
      />
    </div>
  );
}

/* -------------------- Category Chip -------------------- */

function CategoryChip({ category, index, onEdit, onDelete, readonly }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      whileHover={{ y: -2 }}
      className="group relative glass-card !p-3 flex items-center gap-3"
    >
      <div
        className="h-11 w-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{
          background: `${category.color || '#6C63FF'}33`,
          border: `1px solid ${category.color || '#6C63FF'}55`,
        }}
      >
        {category.icon || '📦'}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{category.name}</p>
        {category.isDefault && (
          <Badge variant="default" className="mt-0.5 !text-[10px]">
            Default
          </Badge>
        )}
      </div>

      {!readonly && (
        <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition">
          <button
            onClick={() => onEdit(category)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white transition"
            title="Edit"
          >
            <FiEdit2 size={13} />
          </button>
          <button
            onClick={() => onDelete(category)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-accent-red/10 hover:text-accent-red transition"
            title="Delete"
          >
            <FiTrash2 size={13} />
          </button>
        </div>
      )}
    </motion.div>
  );
}