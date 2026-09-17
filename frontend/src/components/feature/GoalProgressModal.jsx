import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAddGoalProgress } from '../../hooks/queries/useGoals';
import { formatCurrency } from '../../utils/formatters';

const schema = z.object({
  amount: z.coerce.number().positive('Amount must be > 0'),
});

export default function GoalProgressModal({ open, onClose, goal }) {
  const progressMut = useAddGoalProgress();

  const {
    register, handleSubmit, reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const remaining = goal
    ? Number(goal.targetAmount) - Number(goal.currentAmount || 0)
    : 0;

  const onSubmit = (data) => {
    progressMut.mutate(
      { id: goal.id, amount: data.amount },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      }
    );
  };

  if (!goal) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Add Progress — ${goal.name}`}
      size="sm"
    >
      <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Current</span>
          <span className="font-medium">
            {formatCurrency(goal.currentAmount)}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-400">Target</span>
          <span className="font-medium">
            {formatCurrency(goal.targetAmount)}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-400">Remaining</span>
          <span className="font-medium text-primary-400">
            {formatCurrency(remaining)}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Amount to add (₹)"
          type="number"
          step="0.01"
          placeholder="10000"
          error={errors.amount?.message}
          {...register('amount')}
          autoFocus
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={progressMut.isPending}>
            Add Progress
          </Button>
        </div>
      </form>
    </Modal>
  );
}