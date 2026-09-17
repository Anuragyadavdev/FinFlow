export const ACCOUNT_TYPES = [
  { value: 'CASH',        label: 'Cash',         icon: '💵' },
  { value: 'BANK',        label: 'Bank',         icon: '🏦' },
  { value: 'UPI',         label: 'UPI',          icon: '📱' },
  { value: 'CREDIT_CARD', label: 'Credit Card',  icon: '💳' },
  { value: 'SAVINGS',     label: 'Savings',      icon: '💰' },
  { value: 'INVESTMENT',  label: 'Investment',   icon: '📈' },
  { value: 'OTHER',       label: 'Other',        icon: '📦' },
];

export const TRANSACTION_TYPES = [
  { value: 'INCOME',   label: 'Income',   color: 'green' },
  { value: 'EXPENSE',  label: 'Expense',  color: 'red' },
  { value: 'TRANSFER', label: 'Transfer', color: 'blue' },
];

export const BUDGET_PERIODS = [
  { value: 'WEEKLY',    label: 'Weekly' },
  { value: 'MONTHLY',   label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'YEARLY',    label: 'Yearly' },
  { value: 'CUSTOM',    label: 'Custom' },
];

export const GOAL_PRIORITIES = [
  { value: 'LOW',      label: 'Low' },
  { value: 'MEDIUM',   label: 'Medium' },
  { value: 'HIGH',     label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

export const INVESTMENT_TYPES = [
  { value: 'STOCK',          label: 'Stock' },
  { value: 'MUTUAL_FUND',    label: 'Mutual Fund' },
  { value: 'FIXED_DEPOSIT',  label: 'Fixed Deposit' },
  { value: 'BOND',           label: 'Bond' },
  { value: 'GOLD',           label: 'Gold' },
  { value: 'REAL_ESTATE',    label: 'Real Estate' },
  { value: 'CRYPTO',         label: 'Crypto' },
  { value: 'OTHER',          label: 'Other' },
];

export const CHART_RANGES = [
  { value: '1d',  label: '1D' },
  { value: '1w',  label: '1W' },
  { value: '1mo', label: '1M' },
  { value: '3mo', label: '3M' },
  { value: '1y',  label: '1Y' },
];