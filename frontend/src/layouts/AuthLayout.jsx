import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated gradient blobs */}
      <motion.div
        className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl"
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-accent-cyan/20 blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gradient mb-2">FinFlow</h1>
            <p className="text-gray-400 text-sm">
              Financial Intelligence Platform
            </p>
          </div>
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}