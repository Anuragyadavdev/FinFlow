import { motion } from 'framer-motion';
import { FiCpu, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import GlassCard from '../ui/GlassCard';

export default function AiInsightCard({ insights = [] }) {
  if (!insights.length) return null;

  const top = insights[0];
  const rest = insights.slice(1, 3);

  const typeStyles = {
    WARNING:  { color: 'text-accent-amber', icon: '⚠' },
    POSITIVE: { color: 'text-accent-green', icon: '✨' },
    TREND:    { color: 'text-primary-400',  icon: '📈' },
    INFO:     { color: 'text-accent-cyan',  icon: 'ℹ' },
  };

  const style = typeStyles[top.type] || typeStyles.INFO;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlassCard className="relative overflow-hidden border-primary-500/20 bg-gradient-to-br from-primary-500/10 to-transparent">
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-primary flex-shrink-0">
            <FiCpu className="text-white" size={20} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-semibold text-primary-300 uppercase tracking-wider">
                AI Insight
              </p>
              <span className={style.color}>{style.icon}</span>
            </div>
            <p className="text-sm font-semibold text-white mb-0.5">{top.title}</p>
            <p className="text-sm text-gray-300 leading-relaxed">{top.message}</p>

            {rest.length > 0 && (
              <div className="mt-3 space-y-1">
                {rest.map((ins, i) => {
                  const s = typeStyles[ins.type] || typeStyles.INFO;
                  return (
                    <p key={i} className="text-xs text-gray-400 flex items-start gap-2">
                      <span className={s.color}>{s.icon}</span>
                      <span>{ins.message}</span>
                    </p>
                  );
                })}
              </div>
            )}

            <Link
              to="/ai-assistant"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary-400 hover:text-primary-300 transition"
            >
              Ask AI Assistant <FiArrowRight size={14} />
            </Link>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}