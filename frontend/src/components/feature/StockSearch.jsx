import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiPlus } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '../../hooks/useDebounce';
import { useStockSearch, useAddToWatchlist } from '../../hooks/queries/useStocks';

export default function StockSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(query, 350);
  const { data: results = [], isFetching } = useStockSearch(debounced);
  const navigate = useNavigate();
  const addMut = useAddToWatchlist();
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <FiSearch
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
        size={18}
      />
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search stocks (e.g. reliance, tcs, hdfc)"
        className="input-base pl-12 h-12 text-base"
      />

      <AnimatePresence>
        {open && debounced.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute top-full left-0 right-0 mt-2 z-40 glass-card !p-0 overflow-hidden max-h-80 overflow-y-auto"
          >
            {isFetching && (
              <div className="px-4 py-3 text-sm text-gray-400">Searching…</div>
            )}
            {!isFetching && results.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-400">
                No results for "{debounced}"
              </div>
            )}
            {results.map((r) => (
              <div
                key={r.symbol}
                onClick={() => {
                  navigate(`/stocks/${r.symbol}`);
                  setOpen(false);
                  setQuery('');
                }}
                className="flex items-center justify-between px-4 py-3 hover:bg-white/5 cursor-pointer group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {r.shortName || r.symbol}
                  </p>
                  <p className="text-xs text-gray-500">
                    {r.symbol} • {r.exchange}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addMut.mutate({
                      stockSymbol: r.symbol,
                      companyName: r.shortName || r.longName,
                    });
                  }}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-primary-500/10 hover:text-primary-400 transition"
                  title="Add to watchlist"
                >
                  <FiPlus size={16} />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}