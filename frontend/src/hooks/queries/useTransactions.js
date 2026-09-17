import {
  useQuery, useMutation, useQueryClient,
} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { transactionApi } from '../../api/transactionApi';

const KEY = 'transactions';

export function useTransactions(params) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => transactionApi.getAll(params),
    keepPreviousData: true,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: transactionApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Transaction created');
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => transactionApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Transaction updated');
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: transactionApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Transaction deleted');
    },
  });
}