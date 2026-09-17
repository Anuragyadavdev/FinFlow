import {
  useQuery, useMutation, useQueryClient,
} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { accountApi } from '../../api/accountApi';

const KEY = 'accounts';

export function useAccounts() {
  return useQuery({
    queryKey: [KEY],
    queryFn: accountApi.getAll,
    staleTime: 1000 * 60 * 5,
  });
}

export function useTotalBalance() {
  return useQuery({
    queryKey: [KEY, 'total'],
    queryFn: accountApi.totalBalance,
    staleTime: 1000 * 60,
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: accountApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Account created');
    },
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => accountApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Account updated');
    },
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: accountApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Account deleted');
    },
  });
}