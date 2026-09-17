import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiBell, FiAlertTriangle, FiCheckCircle, FiInfo, FiCheck,
  FiChevronLeft, FiChevronRight,
} from 'react-icons/fi';

import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import { timeAgo } from '../utils/formatters';

import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useUnreadNotifications,
} from '../hooks/queries/useNotifications';

const typeIcon = {
  BUDGET_ALERT: FiAlertTriangle,
  BUDGET_EXCEEDED: FiAlertTriangle,
  ANOMALY_DETECTED: FiAlertTriangle,
  GOAL_PROGRESS: FiCheckCircle,
  GOAL_BEHIND: FiAlertTriangle,
  RECURRING_PAYMENT: FiInfo,
  INVESTMENT_ALERT: FiInfo,
  SYSTEM: FiInfo,
  WELCOME: FiCheckCircle,
};

export default function Notifications() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useNotifications(page, 20);
  const { data: unread = 0 } = useUnreadNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const list = data?.content || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Notifications</h1>
          <p className="text-sm text-gray-400">
            {unread > 0 ? `${unread} unread` : 'All caught up'}
          </p>
        </div>
        {unread > 0 && (
          <Button
            variant="outline"
            onClick={() => markAll.mutate()}
            loading={markAll.isPending}
          >
            <FiCheck size={16} /> Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon="🔔"
            title="No notifications"
            description="You're all caught up."
          />
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {list.map((n, i) => {
            const Icon = typeIcon[n.type] || FiBell;
            const isUnread = !n.isRead;
            const iconColor =
              n.severity === 'CRITICAL'
                ? 'text-accent-red bg-accent-red/10'
                : n.severity === 'WARNING'
                ? 'text-accent-amber bg-accent-amber/10'
                : 'text-primary-400 bg-primary-500/10';

            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <GlassCard
                  className={`flex items-start gap-3 cursor-pointer transition ${
                    isUnread ? 'border-l-4 border-l-primary-500' : 'opacity-70'
                  }`}
                  onClick={() => isUnread && markRead.mutate(n.id)}
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-semibold">{n.title}</p>
                      {isUnread && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                      )}
                      <span className="text-xs text-gray-500 ml-auto">
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-gray-400">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <FiChevronLeft size={16} /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Next <FiChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}