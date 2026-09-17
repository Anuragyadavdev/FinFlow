/**
 * Currency & number formatting for Indian locale
 */

export const formatCurrency = (amount, options = {}) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  const value = Number(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: options.decimals ?? 0,
    minimumFractionDigits: options.decimals ?? 0,
  }).format(value);
};

export const formatCompact = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  const value = Number(amount);
  const abs = Math.abs(value);
  if (abs >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(2)}Cr`;
  if (abs >= 1_00_000)    return `₹${(value / 1_00_000).toFixed(2)}L`;
  if (abs >= 1_000)       return `₹${(value / 1_000).toFixed(1)}K`;
  return formatCurrency(value);
};

export const formatNumber = (n) => {
  if (n === null || n === undefined) return '0';
  return new Intl.NumberFormat('en-IN').format(Number(n));
};

export const formatPercent = (n, decimals = 1) => {
  if (n === null || n === undefined || isNaN(n)) return '0%';
  const sign = n > 0 ? '+' : '';
  return `${sign}${Number(n).toFixed(decimals)}%`;
};

export const formatDate = (date, format = 'short') => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const opts = format === 'long'
    ? { day: '2-digit', month: 'long', year: 'numeric' }
    : { day: '2-digit', month: 'short', year: 'numeric' };
  return d.toLocaleDateString('en-IN', opts);
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const timeAgo = (date) => {
  if (!date) return '';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
};