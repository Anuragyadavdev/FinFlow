import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import ProgressRing from '../ui/ProgressRing';
import Badge from '../ui/Badge';

export default function BudgetCard({ budget, onEdit, onDelete, delay = 0 }) {
  const allocated = Number(budget.allocatedAmount || 0);
  const spent = Number(budget.spentAmount || 0);
  const percent = budget.percentageUsed ?? 0;
  const isOver = percent > 100;
  const isWarning = percent >= (budget.alertThreshold ?? 80) && !isOver;

  const ringColor = isOver ? '#EF4444' : isWarning ? '#F59E0B' : '#6C63FF';
  const color = budget.categoryColor || ringColor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -3 }}
      className={`group glass-card p-5 ${
        isOver ? 'border-accent-red/30' : isWarning ? 'border-accent-amber/30' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center text-xl"
            style={{
              background: `${color}33`,
              border: `1px solid ${color}55`,
            }}
          >
            {budget.categoryIcon || '📦'}
          </div>
          <div>
            <p className="text-sm font-semibold">{budget.categoryName}</p>
            <p className="text-xs text-gray-500">{budget.periodType}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition">
          <button
            onClick={() => onEdit(budget)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white transition"
          >
            <FiEdit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(budget)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-accent-red/10 hover:text-accent-red transition"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      {/* Progress ring + numbers */}
      <div className="flex items-center gap-5">
        <ProgressRing
          progress={Math.min(percent, 100)}
          size={110}
          stroke={9}
          color={ringColor}
          label={`${percent.toFixed(0)}%`}
        />

        <div className="flex-1 space-y-2">
          <div>
            <p className="text-xs text-gray-500">Spent</p>
            <p className="text-lg font-bold text-white">
              {formatCurrency(spent)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Of</p>
            <p className="text-sm font-medium text-gray-300">
              {formatCurrency(allocated)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">
              {isOver ? 'Over by' : 'Remaining'}
            </p>
            <p
              className={`text-sm font-medium ${
                isOver ? 'text-accent-red' : 'text-accent-green'
              }`}
            >
              {formatCurrency(Math.abs(allocated - spent))}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
        <span className="text-xs text-gray-500">
          {formatDate(budget.startDate)} → {formatDate(budget.endDate)}
        </span>
        {isOver ? (
          <Badge variant="red">● Exceeded</Badge>
        ) : isWarning ? (
          <Badge variant="amber">⚠ Near limit</Badge>
        ) : (
          <Badge variant="green">● On track</Badge>
        )}
      </div>
    </motion.div>
  );
}