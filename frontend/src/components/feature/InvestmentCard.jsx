import { motion } from 'framer-motion';
import {
  FiEdit2, FiTrash2, FiTrendingUp, FiTrendingDown, FiMinus,
} from 'react-icons/fi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Badge from '../ui/Badge';

const typeEmoji = {
  STOCK: '📈',
  MUTUAL_FUND: '📊',
  FIXED_DEPOSIT: '🏦',
  BOND: '📜',
  GOLD: '🥇',
  REAL_ESTATE: '🏠',
  CRYPTO: '₿',
  OTHER: '📦',
};

export default function InvestmentCard({
  investment, onEdit, onDelete, delay = 0,
}) {
  const invested = Number(investment.investedAmount || 0);
  const current = Number(investment.currentValue || invested);
  const pl = Number(investment.profitLoss || 0);
  const plPct = Number(investment.profitLossPercentage || 0);
  const isProfit = pl > 0.01;
  const isLoss = pl < -0.01;

  const plColor = isProfit
    ? 'text-accent-green'
    : isLoss
    ? 'text-accent-red'
    : 'text-gray-400';

  const PLIcon = isProfit ? FiTrendingUp : isLoss ? FiTrendingDown : FiMinus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -3 }}
      className="group relative glass-card p-5 overflow-hidden"
    >
      {/* Glow by profit/loss */}
      <div
        className={`absolute inset-0 pointer-events-none opacity-30 ${
          isProfit
            ? 'bg-gradient-to-br from-accent-green/15 to-transparent'
            : isLoss
            ? 'bg-gradient-to-br from-accent-red/15 to-transparent'
            : ''
        }`}
      />

      {/* Header */}
      <div className="relative flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-white/5 flex items-center justify-center text-xl">
            {typeEmoji[investment.investmentType] || '📦'}
          </div>
          <div>
            <p className="text-sm font-semibold truncate max-w-[140px]">
              {investment.companyName || investment.stockSymbol || 'Investment'}
            </p>
            <p className="text-xs text-gray-500">
              {investment.investmentType.replace('_', ' ')}
              {investment.quantity ? ` • ${investment.quantity} units` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition">
          <button
            onClick={() => onEdit(investment)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white transition"
          >
            <FiEdit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(investment)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-accent-red/10 hover:text-accent-red transition"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      {/* Values */}
      <div className="relative mb-3">
        <p className="text-xs text-gray-400 mb-0.5">Current Value</p>
        <p className="text-2xl font-bold text-white">
          {formatCurrency(current)}
        </p>
      </div>

      <div className="relative grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
        <div>
          <p className="text-xs text-gray-500">Invested</p>
          <p className="text-sm font-medium">{formatCurrency(invested)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">P&L</p>
          <p className={`text-sm font-medium flex items-center justify-end gap-1 ${plColor}`}>
            <PLIcon size={13} />
            {isProfit ? '+' : ''}{formatCurrency(pl)}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="relative flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <span className="text-xs text-gray-500">
          {investment.purchaseDate ? formatDate(investment.purchaseDate) : ''}
        </span>
        <Badge variant={isProfit ? 'green' : isLoss ? 'red' : 'default'}>
          {isProfit ? '↑' : isLoss ? '↓' : '•'} {Math.abs(plPct).toFixed(2)}%
        </Badge>
      </div>
    </motion.div>
  );
}