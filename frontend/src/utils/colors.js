export const CATEGORY_COLORS = [
  '#6C63FF', '#00D4FF', '#FF6B6B', '#22C55E', '#F59E0B',
  '#A855F7', '#EC4899', '#14B8A6', '#F97316', '#3B82F6',
  '#8B5CF6', '#10B981', '#EF4444', '#6366F1', '#84CC16',
];

export const getCategoryColor = (index) =>
  CATEGORY_COLORS[index % CATEGORY_COLORS.length];

export const getTrendColor = (value) => {
  if (value > 0) return 'text-accent-green';
  if (value < 0) return 'text-accent-red';
  return 'text-gray-400';
};