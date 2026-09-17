import {
  useQuery, useMutation, useQueryClient,
} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { investmentApi } from '../../api/investmentApi';

const KEY = 'investments';

export function useInvestments() {
  return useQuery({
    queryKey: [KEY],
    queryFn: investmentApi.getAll,
    staleTime: 1000 * 60,
  });
}

export function useCreateInvestment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: investmentApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Investment added');
    },
  });
}

export function useUpdateInvestment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => investmentApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Investment updated');
    },
  });
}

export function useDeleteInvestment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: investmentApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Investment removed');
    },
  });
}