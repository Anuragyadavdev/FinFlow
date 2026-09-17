import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiAlertTriangle, FiCheck, FiX, FiRefreshCw, FiChevronLeft, FiChevronRight,
} from 'react-icons/fi';

import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import { formatCurrency, formatDateTime } from '../utils/formatters';

import {
  useAnomalies,
  useReviewAnomaly,
  useScanAnomalies,
  useUnreviewedCount,
} from '../hooks/queries/useAnomalies';

const severityVariant = {
  LOW: 'cyan',
  MEDIUM: 'amber',
  HIGH: 'red',
  CRITICAL: 'red',
};

const typeLabel = {
  UNUSUAL_AMOUNT: 'Unusual Amount',
  UNUSUAL_FREQUENCY: 'Unusual Frequency',
  DUPLICATE_TRANSACTION: 'Duplicate',
  CATEGORY_SPIKE: 'Category Spike',
  UNUSUAL_MERCHANT: 'Unusual Merchant',
  UNUSUAL_TIME: 'Unusual Time',
  UNUSUAL_LOCATION: 'Unusual Location',
};

export default function Anomalies() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useAnomalies(page, 20);
  const { data: unreviewed = 0 } = useUnreviewedCount();
  const reviewMut = useReviewAnomaly();
  const scanMut = useScanAnomalies();

  const list = data?.content || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold mb-1">Anomalies</h1>
          <p className="text-sm text-gray-400">
            Unusual activity detected by our rules engine
            {unreviewed > 0 && (
              <span className="ml-2 text-accent-amber">
                • {unreviewed} unreviewed
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => scanMut.mutate()} loading={scanMut.isPending}>
          <FiRefreshCw size={16} /> Run Scan
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon="✅"
            title="No anomalies found"
            description="Your transactions look normal. Click 'Run Scan' to check again."
          />
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {list.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <GlassCard
                className={`border-l-4 ${
                  a.severity === 'HIGH' || a.severity === 'CRITICAL'
                    ? 'border-l-accent-red'
                    : a.severity === 'MEDIUM'
                    ? 'border-l-accent-amber'
                    : 'border-l-accent-cyan'
                } ${a.isReviewed ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-accent-amber/10 flex items-center justify-center flex-shrink-0">
                      <FiAlertTriangle className="text-accent-amber" size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant={severityVariant[a.severity] || 'default'}>
                          {a.severity}
                        </Badge>
                        <Badge variant="default">{typeLabel[a.anomalyType] || a.anomalyType}</Badge>
                        {a.isReviewed && <Badge variant="green">✓ Reviewed</Badge>}
                      </div>
                      <p className="text-sm text-gray-200 leading-relaxed">
                        {a.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
                        {a.transactionAmount && (
                          <span>Amount: <span className="text-white">{formatCurrency(a.transactionAmount)}</span></span>
                        )}
                        {a.categoryName && <span>Category: {a.categoryName}</span>}
                        {a.accountName && <span>Account: {a.accountName}</span>}
                        {a.transactionDate && (
                          <span>• {formatDateTime(a.transactionDate)}</span>
                        )}
                      </div>
                      {a.expectedValue != null && a.actualValue != null && (
                        <div className="mt-2 text-xs">
                          <span className="text-gray-500">Expected: </span>
                          <span className="text-gray-300">{formatCurrency(a.expectedValue)}</span>
                          <span className="text-gray-500 ml-2">Actual: </span>
                          <span className="text-white font-medium">{formatCurrency(a.actualValue)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {!a.isReviewed && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          reviewMut.mutate({ id: a.id, isFalsePositive: true, reviewNotes: 'Marked as expected' })
                        }
                      >
                        <FiX size={14} /> Dismiss
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          reviewMut.mutate({ id: a.id, isFalsePositive: false, reviewNotes: 'Confirmed unusual' })
                        }
                      >
                        <FiCheck size={14} /> Confirm
                      </Button>
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
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