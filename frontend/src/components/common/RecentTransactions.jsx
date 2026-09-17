import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowUpRight, FiArrowDownLeft, FiRepeat, FiChevronRight } from 'react-icons/fi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import EmptyState from '../ui/EmptyState';
import Badge from '../ui/Badge';

const iconFor = (type) => {
  if (type === 'INCOME') return { Icon: FiArrowDownLeft, cls: 'text-accent-green bg-accent-green/10' };
  if (type === 'EXPENSE') return { Icon: FiArrowUpRight, cls: 'text-accent-red bg-accent-red/10' };
  return { Icon: FiRepeat, cls: 'text-primary-400 bg-primary-500/10' };
};

export default function RecentTransactions({ transactions = [] }) {
  if (!transactions.length) {
    return (
      <EmptyState
        icon="📝"
        title="No transactions yet"
        description="Start by adding your first transaction."
      />
    );
  }

  return (
    <div className="space-y-2">
      {transactions.slice(0, 8).map((t, i) => {
        const { Icon, cls } = iconFor(t.type);
        const isIncome = t.type === 'INCOME';
        return (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition group"
          >
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${cls}`}>
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {t.description || t.categoryName || 'Transaction'}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{formatDate(t.transactionDate)}</span>
                {t.categoryName && (
                  <>
                    <span>•</span>
                    <span>{t.categoryName}</span>
                  </>
                )}
                {t.isAnomaly && <Badge variant="amber">⚠ Unusual</Badge>}
              </div>
            </div>
            <div className="text-right">
              <p
                className={`text-sm font-semibold ${
                  isIncome ? 'text-accent-green' : 'text-accent-red'
                }`}
              >
                {isIncome ? '+' : '−'} {formatCurrency(t.amount)}
              </p>
              <p className="text-xs text-gray-500">{t.accountName}</p>
            </div>
          </motion.div>
        );
      })}

      {transactions.length > 8 && (
        <Link
          to="/transactions"
          className="flex items-center justify-center gap-1 py-3 text-sm text-primary-400 hover:text-primary-300 transition"
        >
          View all <FiChevronRight size={16} />
        </Link>
      )}
    </div>
  );
}