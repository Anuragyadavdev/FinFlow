import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';
import AnimatedNumber from '../ui/AnimatedNumber';
import Badge from '../ui/Badge';

const typeStyle = {
  CASH:        { icon: '💵', grad: 'from-green-500/20 to-green-500/0',   badge: 'green' },
  BANK:        { icon: '🏦', grad: 'from-primary-500/20 to-primary-500/0', badge: 'primary' },
  UPI:         { icon: '📱', grad: 'from-accent-cyan/20 to-accent-cyan/0', badge: 'cyan' },
  CREDIT_CARD: { icon: '💳', grad: 'from-accent-red/20 to-accent-red/0',   badge: 'red' },
  SAVINGS:     { icon: '💰', grad: 'from-accent-amber/20 to-accent-amber/0', badge: 'amber' },
  INVESTMENT:  { icon: '📈', grad: 'from-primary-500/20 to-primary-500/0', badge: 'primary' },
  OTHER:       { icon: '📦', grad: 'from-gray-500/20 to-gray-500/0',       badge: 'default' },
};

export default function AccountCard({ account, onEdit, onDelete, delay = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const style = typeStyle[account.type] || typeStyle.OTHER;
  const isNegative = Number(account.balance) < 0;

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -4 }}
      className={`relative overflow-hidden glass-card p-5 bg-gradient-to-br ${style.grad}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-xl">
            {style.icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-white truncate max-w-[140px]">
              {account.name}
            </p>
            <p className="text-xs text-gray-400">{account.type.replace('_', ' ')}</p>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white transition"
          >
            <FiMoreVertical size={16} />
          </button>

          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-1 z-20 w-32 glass-card !p-1 overflow-hidden"
            >
              <button
                onClick={() => { setMenuOpen(false); onEdit(account); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white rounded-lg transition"
              >
                <FiEdit2 size={14} /> Edit
              </button>
              <button
                onClick={() => { setMenuOpen(false); onDelete(account); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-accent-red hover:bg-accent-red/10 rounded-lg transition"
              >
                <FiTrash2 size={14} /> Delete
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Balance */}
      <div className="mb-3">
        <p className="text-xs text-gray-400 mb-1">Balance</p>
        <p
          className={`text-2xl font-bold ${
            isNegative ? 'text-accent-red' : 'text-white'
          }`}
        >
          <AnimatedNumber value={Number(account.balance)} />
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <Badge variant={style.badge}>
          {account.isActive ? '● Active' : '○ Inactive'}
        </Badge>
        {account.bankName && (
          <p className="text-xs text-gray-500 truncate max-w-[120px]">
            {account.bankName}
          </p>
        )}
      </div>
    </motion.div>
  );
}