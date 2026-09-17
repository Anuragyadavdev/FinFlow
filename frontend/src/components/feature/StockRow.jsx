import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export default function StockRow({ quote, index = 0, action }) {
  const navigate = useNavigate();
  const isUp = Number(quote.changePercent) >= 0;

  const handleClick = () => {
    if (quote.symbol) navigate(`/stocks/${quote.symbol}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      className="group grid grid-cols-12 gap-3 items-center px-4 py-3 border-b border-white/5 hover:bg-white/5 transition cursor-pointer"
      onClick={handleClick}
    >
      <div className="col-span-5 min-w-0">
        <p className="text-sm font-semibold truncate">
          {quote.shortName || quote.symbol}
        </p>
        <p className="text-xs text-gray-500">{quote.symbol}</p>
      </div>

      <div className="col-span-4 text-right">
        <p className="text-sm font-medium">
          {formatCurrency(quote.currentPrice, { decimals: 2 })}
        </p>
      </div>

      <div
        className={`col-span-3 text-right text-sm font-medium ${
          isUp ? 'text-accent-green' : 'text-accent-red'
        }`}
      >
        {formatPercent(quote.changePercent)}
      </div>

      {action && (
        <div
          className="col-span-12 md:col-span-2 md:absolute md:right-4 flex justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          {action}
        </div>
      )}
    </motion.div>
  );
}