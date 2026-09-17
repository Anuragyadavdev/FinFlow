import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { GOAL_PRIORITIES } from '../../utils/constants';
import {
  useCreateGoal,
  useUpdateGoal,
} from '../../hooks/queries/useGoals';

const schema = z.object({
  name: z.string().min(1, 'Name required').max(200),
  description: z.string().max(500).optional(),
  targetAmount: z.coerce.number().positive('Target must be > 0'),
  targetDate: z.string().min(1, 'Target date is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  icon: z.string().default('🎯'),
  color: z.string().default('#6C63FF'),
});

const ICONS = ['🎯','💻','📱','🏠','🚗','✈️','🎓','💍','🏖️','💰','📷','🎸','🏋️','📚','🎁'];

export default function GoalFormModal({ open, onClose, goal }) {
  const isEdit = !!goal;
  const createMut = useCreateGoal();
  const updateMut = useUpdateGoal();

  const {
    register, handleSubmit, reset, watch, setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'MEDIUM', icon: '🎯', color: '#6C63FF' },
  });

  const icon = watch('icon');
  const priority = watch('priority');
  const name = watch('name');
  const target = watch('targetAmount');

  useEffect(() => {
    if (open && goal) {
      reset({
        name: goal.name,
        description: goal.description || '',
        targetAmount: goal.targetAmount,
        targetDate: goal.targetDate,
        priority: goal.priority || 'MEDIUM',
        icon: goal.icon || '🎯',
        color: goal.color || '#6C63FF',
      });
    } else if (open) {
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      reset({
        name: '',
        description: '',
        targetAmount: '',
        targetDate: nextYear.toISOString().slice(0, 10),
        priority: 'MEDIUM',
        icon: '🎯',
        color: '#6C63FF',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, goal]);

  const onSubmit = (data) => {
    if (isEdit) {
      updateMut.mutate({ id: goal.id, data }, { onSuccess: onClose });
    } else {
      createMut.mutate(data, { onSuccess: onClose });
    }
  };

  const isLoading = createMut.isPending || updateMut.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Goal' : 'New Financial Goal'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Goal Name"
          placeholder="e.g. Buy a MacBook Pro"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Target Amount (₹)"
            type="number"
            step="0.01"
            placeholder="150000"
            error={errors.targetAmount?.message}
            {...register('targetAmount')}
          />
          <Input
            label="Target Date"
            type="date"
            error={errors.targetDate?.message}
            {...register('targetDate')}
          />
        </div>

        {/* Priority */}
        <div>
          <label className="label-base">Priority</label>
          <div className="grid grid-cols-4 gap-2">
            {GOAL_PRIORITIES.map((p) => {
              const colors = {
                LOW: 'text-gray-400',
                MEDIUM: 'text-primary-400',
                HIGH: 'text-accent-amber',
                CRITICAL: 'text-accent-red',
              };
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setValue('priority', p.value)}
                  className={`py-2 rounded-xl text-xs font-medium border transition ${
                    priority === p.value
                      ? `border-white/20 bg-white/10 ${colors[p.value]}`
                      : 'border-white/10 text-gray-500 hover:border-white/20'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Icon */}
        <div>
          <label className="label-base">Icon</label>
          <div className="grid grid-cols-10 gap-1.5">
            {ICONS.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => setValue('icon', ic)}
                className={`h-9 rounded-lg flex items-center justify-center text-lg transition ${
                  icon === ic
                    ? 'bg-primary-500/30 ring-2 ring-primary-500'
                    : 'hover:bg-white/10'
                }`}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        {name && target && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-primary-500/20 flex items-center justify-center text-xl">
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium">{name}</p>
              <p className="text-xs text-gray-400">
                Target: ₹{Number(target).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        )}

        <div>
          <label className="label-base">Description (optional)</label>
          <textarea
            className="input-base min-h-[70px]"
            placeholder="Why do you want this?"
            {...register('description')}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            {isEdit ? 'Update' : 'Create'} Goal
          </Button>
        </div>
      </form>
    </Modal>
  );
}