import {
  useQuery, useMutation, useQueryClient,
} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { budgetApi } from '../../api/budgetApi';

const KEY = 'budgets';

export function useBudgets() {
  return useQuery({
    queryKey: [KEY],
    queryFn: budgetApi.getAll,
    staleTime: 1000 * 30,
  });
}

export function useActiveBudgets() {
  return useQuery({
    queryKey: [KEY, 'active'],
    queryFn: budgetApi.getActive,
    staleTime: 1000 * 30,
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: budgetApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Budget created');
    },
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => budgetApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Budget updated');
    },
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: budgetApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Budget deleted');
    },
  });
}