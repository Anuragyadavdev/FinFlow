import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { BUDGET_PERIODS } from '../../utils/constants';
import { useCategories } from '../../hooks/queries/useCategories';
import {
  useCreateBudget,
  useUpdateBudget,
} from '../../hooks/queries/useBudgets';

const schema = z
  .object({
    categoryId: z.coerce.number().int().positive('Select a category'),
    allocatedAmount: z.coerce.number().positive('Amount must be > 0'),
    periodType: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM']),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    alertThreshold: z.coerce.number().int().min(1).max(100).default(80),
    notes: z.string().max(500).optional(),
  })
  .refine((d) => new Date(d.endDate) >= new Date(d.startDate), {
    path: ['endDate'],
    message: 'End date must be after start date',
  });

const today = () => new Date().toISOString().slice(0, 10);
const endOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);
};

export default function BudgetFormModal({ open, onClose, budget }) {
  const isEdit = !!budget;
  const createMut = useCreateBudget();
  const updateMut = useUpdateBudget();
  const { data: categories = [] } = useCategories('EXPENSE');

  const {
    register, handleSubmit, reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      periodType: 'MONTHLY',
      startDate: today(),
      endDate: endOfMonth(),
      alertThreshold: 80,
    },
  });

  useEffect(() => {
    if (open && budget) {
      reset({
        categoryId: budget.categoryId,
        allocatedAmount: budget.allocatedAmount,
        periodType: budget.periodType,
        startDate: budget.startDate,
        endDate: budget.endDate,
        alertThreshold: budget.alertThreshold ?? 80,
        notes: budget.notes || '',
      });
    } else if (open) {
      reset({
        categoryId: '',
        allocatedAmount: '',
        periodType: 'MONTHLY',
        startDate: today(),
        endDate: endOfMonth(),
        alertThreshold: 80,
        notes: '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, budget]);

  const onSubmit = (data) => {
    if (isEdit) {
      updateMut.mutate({ id: budget.id, data }, { onSuccess: onClose });
    } else {
      createMut.mutate(data, { onSuccess: onClose });
    }
  };

  const isLoading = createMut.isPending || updateMut.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Budget' : 'New Budget'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label-base">Category</label>
          <select className="input-base" {...register('categoryId')}>
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-xs text-accent-red">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        <Input
          label="Allocated Amount (₹)"
          type="number"
          step="0.01"
          placeholder="5000"
          error={errors.allocatedAmount?.message}
          {...register('allocatedAmount')}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label-base">Period</label>
            <select className="input-base" {...register('periodType')}>
              {BUDGET_PERIODS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Start Date"
            type="date"
            error={errors.startDate?.message}
            {...register('startDate')}
          />
          <Input
            label="End Date"
            type="date"
            error={errors.endDate?.message}
            {...register('endDate')}
          />
        </div>

        <div>
          <label className="label-base">
            Alert Threshold (% of budget)
          </label>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            className="w-full accent-primary-500"
            {...register('alertThreshold')}
          />
          <p className="mt-1 text-xs text-gray-400">
            Alert when spending crosses this percentage
          </p>
        </div>

        <div>
          <label className="label-base">Notes (optional)</label>
          <textarea
            className="input-base min-h-[70px]"
            placeholder="Why this budget?"
            {...register('notes')}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            {isEdit ? 'Update' : 'Create'} Budget
          </Button>
        </div>
      </form>
    </Modal>
  );
}