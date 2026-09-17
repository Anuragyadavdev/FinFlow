import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiPlus, FiStar, FiTrendingUp, FiTrendingDown,
} from 'react-icons/fi';

import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import StockCandleChart from '../components/charts/StockCandleChart';

import {
  useStockQuote,
  useStockChart,
  useAddToWatchlist,
} from '../hooks/queries/useStocks';
import { CHART_RANGES } from '../utils/constants';
import { formatCurrency, formatPercent } from '../utils/formatters';

export default function StockDetail() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [range, setRange] = useState('1mo');

  const { data: quote, isLoading: loadQ } = useStockQuote(symbol);
  const { data: chart, isLoading: loadC } = useStockChart(symbol, range);
  const addMut = useAddToWatchlist();

  const isUp = Number(quote?.changePercent || 0) >= 0;

  return (
    <div className="animate-fade-in">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition mb-4"
      >
        <FiArrowLeft size={16} /> Back to stocks
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        {loadQ ? (
          <Skeleton className="h-20 w-64" />
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">
                {quote?.shortName || quote?.longName || symbol}
              </h1>
              <Badge variant="primary">{symbol}</Badge>
              {quote?.exchange && <Badge>{quote.exchange}</Badge>}
            </div>
            <div className="flex items-baseline gap-3">
              <p className="text-3xl font-bold">
                {formatCurrency(quote?.currentPrice, { decimals: 2 })}
              </p>
              <p
                className={`text-lg font-semibold ${
                  isUp ? 'text-accent-green' : 'text-accent-red'
                }`}
              >
                {isUp ? <FiTrendingUp className="inline" /> : <FiTrendingDown className="inline" />}{' '}
                {formatCurrency(quote?.change, { decimals: 2 })} (
                {formatPercent(quote?.changePercent)})
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Previous close: {formatCurrency(quote?.previousClose, { decimals: 2 })}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              addMut.mutate({
                stockSymbol: symbol,
                companyName: quote?.shortName,
                targetPrice: quote?.currentPrice,
              })
            }
            loading={addMut.isPending}
          >
            <FiPlus size={16} /> Watchlist
          </Button>
        </div>
      </div>

      {/* Chart */}
      <GlassCard className="mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-semibold">Price Chart</h3>
          <div className="flex gap-1 p-1 rounded-xl bg-white/5">
            {CHART_RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  range === r.value
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <StockCandleChart chart={chart} isLoading={loadC} />
      </GlassCard>

      {/* Stats grid */}
      {!loadQ && quote && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox label="Day High"  value={formatCurrency(quote.dayHigh, { decimals: 2 })} />
          <StatBox label="Day Low"   value={formatCurrency(quote.dayLow, { decimals: 2 })} />
          <StatBox label="52W High"  value={formatCurrency(quote.fiftyTwoWeekHigh, { decimals: 2 })} />
          <StatBox label="52W Low"   value={formatCurrency(quote.fiftyTwoWeekLow, { decimals: 2 })} />
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <GlassCard>
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-lg font-semibold">{value}</p>
    </GlassCard>
  );
}