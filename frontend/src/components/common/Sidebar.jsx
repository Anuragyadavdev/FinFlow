import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHome, FiCreditCard, FiList, FiPieChart, FiTarget,
  FiTrendingUp, FiBarChart2, FiAlertTriangle, FiCpu,
  FiSettings, FiBell, FiActivity,
} from 'react-icons/fi';

const nav = [
  { section: 'Main', items: [
    { to: '/dashboard',     label: 'Dashboard',     icon: FiHome },
    { to: '/transactions',  label: 'Transactions',  icon: FiList },
    { to: '/accounts',      label: 'Accounts',      icon: FiCreditCard },
    { to: '/categories',    label: 'Categories',    icon: FiActivity },
  ]},
  { section: 'Plan', items: [
    { to: '/budgets',       label: 'Budgets',       icon: FiPieChart },
    { to: '/goals',         label: 'Goals',         icon: FiTarget },
    { to: '/investments',   label: 'Investments',   icon: FiTrendingUp },
    { to: '/ai-advisor',    label: 'AI Advisor',      icon: FiCpu },
  ]},
  { section: 'Intelligence', items: [
    { to: '/stocks',        label: 'Stock Market',  icon: FiBarChart2 },
    { to: '/analytics',     label: 'Analytics',     icon: FiActivity },
    { to: '/anomalies',     label: 'Anomalies',     icon: FiAlertTriangle },
    { to: '/ai-assistant',  label: 'AI Assistant',  icon: FiCpu },
  ]},
  { section: 'Account', items: [
    { to: '/notifications', label: 'Notifications', icon: FiBell },
    { to: '/settings',      label: 'Settings',      icon: FiSettings },
  ]},
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-white/5 bg-black/20 backdrop-blur-xl">
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <span className="text-xl font-bold text-gradient">FinFlow</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        {nav.map((group) => (
          <div key={group.section} className="mb-4">
            <p className="px-6 mb-2 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
              {group.section}
            </p>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 px-6 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'text-white bg-white/5'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-xl bg-gradient-primary/15 border border-primary-500/30"
                        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                      />
                    )}
                    <item.icon size={18} className="relative z-10" />
                    <span className="relative z-10">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 text-xs text-gray-500 text-center">
        FinFlow v1.0
      </div>
    </aside>
  );
}