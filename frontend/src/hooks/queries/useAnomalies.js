import {
  useQuery, useMutation, useQueryClient,
} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { anomalyApi } from '../../api/anomalyApi';

const KEY = 'anomalies';

export function useAnomalies(page = 0, size = 20) {
  return useQuery({
    queryKey: [KEY, page, size],
    queryFn: () => anomalyApi.list({ page, size }),
    keepPreviousData: true,
  });
}

export function useUnreviewedCount() {
  return useQuery({
    queryKey: [KEY, 'unreviewed'],
    queryFn: anomalyApi.unreviewedCount,
    refetchInterval: 1000 * 60,
  });
}

export function useReviewAnomaly() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => anomalyApi.review(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success('Review saved');
    },
  });
}

export function useScanAnomalies() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: anomalyApi.scan,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Scan complete — ${data.newAnomalies} new detected`);
    },
  });
}