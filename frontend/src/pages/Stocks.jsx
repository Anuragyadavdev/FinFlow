import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiTrendingUp, FiTrendingDown, FiStar, FiX, FiRefreshCw,
} from 'react-icons/fi';

import GlassCard from '../components/ui/GlassCard';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import StockSearch from '../components/feature/StockSearch';
import StockRow from '../components/feature/StockRow';

import {
  useGainers,
  useLosers,
  useWatchlist,
  useRemoveFromWatchlist,
} from '../hooks/queries/useStocks';

export default function Stocks() {
  const [tab, setTab] = useState('gainers');

  const { data: gainers = [], isLoading: loadG } = useGainers();
  const { data: losers = [], isLoading: loadL } = useLosers();
  const { data: watchlist = [], isLoading: loadW } = useWatchlist();
  const removeMut = useRemoveFromWatchlist();

  const tabs = [
    { v: 'gainers', l: 'Top Gainers', icon: FiTrendingUp, color: 'text-accent-green' },
    { v: 'losers',  l: 'Top Losers',  icon: FiTrendingDown, color: 'text-accent-red' },
    { v: 'watchlist', l: 'My Watchlist', icon: FiStar, color: 'text-accent-amber' },
  ];

  const list = tab === 'gainers' ? gainers : tab === 'losers' ? losers : watchlist;
  const isLoading =
    tab === 'gainers' ? loadG : tab === 'losers' ? loadL : loadW;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Stock Market</h1>
            <p className="text-sm text-gray-400">
              Live prices from NSE • Powered by Yahoo Finance
            </p>
          </div>
          <Badge variant="cyan" className="gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan animate-pulse" />
            LIVE
          </Badge>
        </div>

        {/* Search */}
        <StockSearch />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 rounded-xl bg-white/5 w-fit flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.v}
            onClick={() => setTab(t.v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.v
                ? `bg-white/10 text-white`
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <t.icon size={14} className={tab === t.v ? t.color : ''} />
            {t.l}
          </button>
        ))}
      </div>

      {/* List */}
      <GlassCard className="!p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            icon={tab === 'watchlist' ? '⭐' : '📊'}
            title={
              tab === 'watchlist'
                ? 'Your watchlist is empty'
                : 'No data available'
            }
            description={
              tab === 'watchlist'
                ? 'Search stocks above and click + to add them here.'
                : 'Market data is temporarily unavailable. Try again later.'
            }
          />
        ) : (
          <>
            {/* Table header */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 border-b border-white/5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-5">Company</div>
              <div className="col-span-4 text-right">Price</div>
              <div className="col-span-3 text-right">Change</div>
            </div>

            {list.map((q, i) => (
              <StockRow
                key={q.symbol || q.id}
                quote={q}
                index={i}
                action={
                  tab === 'watchlist' ? (
                    <button
                      onClick={() => removeMut.mutate(q.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-accent-red/10 hover:text-accent-red transition"
                      title="Remove"
                    >
                      <FiX size={14} />
                    </button>
                  ) : null
                }
              />
            ))}
          </>
        )}
      </GlassCard>

      <p className="text-xs text-gray-600 text-center mt-4">
        Data provided by Yahoo Finance. Not for trading decisions.
      </p>
    </div>
  );
}