import {
  useQuery, useMutation, useQueryClient,
} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { goalApi } from '../../api/goalApi';

const KEY = 'goals';

export function useGoals() {
  return useQuery({
    queryKey: [KEY],
    queryFn: goalApi.getAll,
    staleTime: 1000 * 30,
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: goalApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Goal created');
    },
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => goalApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Goal updated');
    },
  });
}

export function useAddGoalProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }) => goalApi.addProgress(id, amount),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      if (data?.status === 'COMPLETED') {
        toast.success('🎉 Goal completed!', { duration: 4000 });
      } else {
        toast.success('Progress added');
      }
    },
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: goalApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Goal deleted');
    },
  });
}