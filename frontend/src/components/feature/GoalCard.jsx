import { motion } from 'framer-motion';
import {
  FiEdit2, FiTrash2, FiPlus, FiCalendar, FiTrendingUp,
} from 'react-icons/fi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Badge from '../ui/Badge';

const priorityVariant = {
  LOW: 'default',
  MEDIUM: 'primary',
  HIGH: 'amber',
  CRITICAL: 'red',
};

export default function GoalCard({
  goal, onEdit, onDelete, onAddProgress, delay = 0,
}) {
  const current = Number(goal.currentAmount || 0);
  const target = Number(goal.targetAmount || 0);
  const percent = goal.progressPercentage ?? 0;
  const isCompleted = goal.status === 'COMPLETED' || percent >= 100;
  const monthly = Number(goal.monthlySavingsRequired || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -3 }}
      className={`group relative glass-card p-5 overflow-hidden ${
        isCompleted ? 'border-accent-green/30' : ''
      }`}
    >
      {/* Completed glow */}
      {isCompleted && (
        <div className="absolute inset-0 bg-gradient-to-br from-accent-green/10 to-transparent pointer-events-none" />
      )}

      {/* Header */}
      <div className="relative flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl">
            {goal.icon || '🎯'}
          </div>
          <div>
            <p className="text-sm font-semibold">{goal.name}</p>
            <Badge variant={priorityVariant[goal.priority] || 'default'} className="mt-1">
              {goal.priority}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition">
          <button
            onClick={() => onAddProgress(goal)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-primary-500/10 hover:text-primary-400 transition"
            title="Add progress"
          >
            <FiPlus size={15} />
          </button>
          <button
            onClick={() => onEdit(goal)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white transition"
            title="Edit"
          >
            <FiEdit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(goal)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-accent-red/10 hover:text-accent-red transition"
            title="Delete"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative mb-3">
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-xs text-gray-400">Saved</p>
            <p className="text-xl font-bold">{formatCurrency(current)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Target</p>
            <p className="text-sm font-medium text-gray-300">
              {formatCurrency(target)}
            </p>
          </div>
        </div>

        <div className="relative h-2.5 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className={`absolute inset-y-0 left-0 rounded-full ${
              isCompleted
                ? 'bg-gradient-to-r from-accent-green to-accent-cyan'
                : 'bg-gradient-primary'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percent, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-xs">
          <span className="text-gray-400">{percent.toFixed(1)}% complete</span>
          {!isCompleted && monthly > 0 && (
            <span className="text-primary-400 flex items-center gap-1">
              <FiTrendingUp size={11} /> ₹{monthly.toLocaleString('en-IN')}/mo needed
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="relative flex items-center justify-between pt-3 border-t border-white/5">
        {goal.targetDate && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <FiCalendar size={11} /> {formatDate(goal.targetDate)}
          </span>
        )}
        {isCompleted ? (
          <Badge variant="green">🎉 Completed</Badge>
        ) : goal.isBehindSchedule ? (
          <Badge variant="red">⚠ Behind</Badge>
        ) : (
          <Badge variant="primary">On Track</Badge>
        )}
      </div>
    </motion.div>
  );
}