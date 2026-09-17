import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api/analyticsApi';

export function useAnalytics(months = 6) {
  return useQuery({
    queryKey: ['analytics', months],
    queryFn: () => analyticsApi.lastMonths(months),
    staleTime: 1000 * 60,
  });
}