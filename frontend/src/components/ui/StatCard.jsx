import clsx from 'clsx';
import { motion } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';

export default function StatCard({
  title,
  value,
  change,
  icon,
  accent = 'primary',
  prefix = '₹',
  suffix = '',
  delay = 0,
}) {
  const accents = {
    primary: 'from-primary-500/20 to-primary-500/0 border-primary-500/20',
    green:   'from-accent-green/20 to-accent-green/0 border-accent-green/20',
    red:     'from-accent-red/20 to-accent-red/0 border-accent-red/20',
    cyan:    'from-accent-cyan/20 to-accent-cyan/0 border-accent-cyan/20',
    amber:   'from-accent-amber/20 to-accent-amber/0 border-accent-amber/20',
  };

  const glowMap = {
    primary: 'shadow-glow-primary',
    green:   'shadow-glow-green',
    red:     'shadow-glow-red',
    cyan:    'shadow-glow-cyan',
    amber:   'shadow-glow-primary',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -3 }}
      className={clsx(
        'relative overflow-hidden glass-card p-5 group cursor-default',
        'bg-gradient-to-br',
        accents[accent]
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            {title}
          </p>
        </div>
        <div
          className={clsx(
            'text-2xl opacity-80 group-hover:opacity-100 group-hover:scale-110 transition',
            glowMap[accent]
          )}
        >
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold text-white">
          {prefix && <span className="text-lg text-gray-400 mr-0.5">{prefix}</span>}
          <AnimatedNumber value={Number(value) || 0} format="currency" />
          {suffix && <span className="text-sm text-gray-400 ml-1">{suffix}</span>}
        </div>
      </div>

      {change !== undefined && change !== null && (
        <p
          className={clsx(
            'mt-2 text-xs font-medium',
            change > 0
              ? 'text-accent-green'
              : change < 0
              ? 'text-accent-red'
              : 'text-gray-400'
          )}
        >
          {change > 0 ? '↑' : change < 0 ? '↓' : '•'}{' '}
          {Math.abs(Number(change)).toFixed(1)}% vs last period
        </p>
      )}
    </motion.div>
  );
}