import { FiSearch, FiX } from 'react-icons/fi';

export default function TransactionFilters({ filters, onChange, onReset }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="glass-card p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative md:col-span-2">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            className="input-base pl-10"
            placeholder="Search description, merchant..."
            value={filters.search || ''}
            onChange={(e) => set('search', e.target.value)}
          />
        </div>

        {/* Type */}
        <select
          className="input-base"
          value={filters.type || ''}
          onChange={(e) => set('type', e.target.value || undefined)}
        >
          <option value="">All Types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
          <option value="TRANSFER">Transfer</option>
        </select>

        {/* Sort */}
        <select
          className="input-base"
          value={filters.sortBy || 'transactionDate'}
          onChange={(e) => set('sortBy', e.target.value)}
        >
          <option value="transactionDate">Sort: Date</option>
          <option value="amount">Sort: Amount</option>
          <option value="createdAt">Sort: Created</option>
        </select>
      </div>

      {(filters.search || filters.type || filters.sortBy) && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition"
          >
            <FiX size={14} /> Clear filters
          </button>
        </div>
      )}
    </div>
  );
}