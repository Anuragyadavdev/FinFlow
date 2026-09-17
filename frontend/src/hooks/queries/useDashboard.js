import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api/dashboardApi';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getSummary,
    staleTime: 1000 * 60,     // 1 min
    refetchOnWindowFocus: true,
  });
}