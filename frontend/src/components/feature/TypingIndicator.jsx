import { motion } from 'framer-motion';
import { FiCpu } from 'react-icons/fi';

export default function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-accent-cyan/30 to-primary-500/30 border border-primary-500/30">
        <FiCpu className="text-primary-300" size={16} />
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-white/5 border border-white/10 px-4 py-3 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block h-1.5 w-1.5 rounded-full bg-primary-400"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}