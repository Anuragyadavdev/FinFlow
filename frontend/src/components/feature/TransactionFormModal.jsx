import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import {
  useCreateTransaction,
  useUpdateTransaction,
} from '../../hooks/queries/useTransactions';
import { useAccounts } from '../../hooks/queries/useAccounts';
import { useCategories } from '../../hooks/queries/useCategories';

const schema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  amount: z.coerce.number().positive('Amount must be > 0'),
  accountId: z.coerce.number().int().positive('Select an account'),
  toAccountId: z.coerce.number().optional().nullable(),
  categoryId: z.coerce.number().optional().nullable(),
  transactionDate: z.string().min(1, 'Date is required'),
  description: z.string().max(500).optional(),
  merchantName: z.string().max(200).optional(),
  notes: z.string().optional(),
});

const toLocalDateTimeString = (date) => {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

export default function TransactionFormModal({ open, onClose, transaction }) {
  const isEdit = !!transaction;
  const createMut = useCreateTransaction();
  const updateMut = useUpdateTransaction();
  const { data: accounts = [] } = useAccounts();

  const {
    register, handleSubmit, watch, reset, setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'EXPENSE',
      transactionDate: toLocalDateTimeString(new Date()),
    },
  });

  const type = watch('type');
  const { data: categories = [] } = useCategories(
    type === 'TRANSFER' ? undefined : type
  );

  useEffect(() => {
    if (open && transaction) {
      reset({
        type: transaction.type,
        amount: transaction.amount,
        accountId: transaction.accountId,
        toAccountId: transaction.toAccountId || null,
        categoryId: transaction.categoryId || null,
        transactionDate: toLocalDateTimeString(transaction.transactionDate),
        description: transaction.description || '',
        merchantName: transaction.merchantName || '',
        notes: transaction.notes || '',
      });
    } else if (open) {
      reset({
        type: 'EXPENSE',
        amount: '',
        accountId: accounts[0]?.id || '',
        toAccountId: null,
        categoryId: null,
        transactionDate: toLocalDateTimeString(new Date()),
        description: '',
        merchantName: '',
        notes: '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, transaction]);

  // Reset category when type changes
  useEffect(() => {
    if (open && !isEdit) setValue('categoryId', null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const onSubmit = (data) => {
    const payload = {
      ...data,
      transactionDate: new Date(data.transactionDate).toISOString(),
      toAccountId: data.type === 'TRANSFER' ? data.toAccountId : null,
      categoryId: data.type === 'TRANSFER' ? null : data.categoryId || null,
    };
    if (isEdit) {
      updateMut.mutate(
        { id: transaction.id, data: payload },
        { onSuccess: onClose }
      );
    } else {
      createMut.mutate(payload, { onSuccess: onClose });
    }
  };

  const isLoading = createMut.isPending || updateMut.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Transaction' : 'New Transaction'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Type tabs */}
        <div className="flex gap-2 p-1 rounded-xl bg-white/5">
          {[
            { v: 'EXPENSE', l: 'Expense', c: 'text-accent-red' },
            { v: 'INCOME', l: 'Income', c: 'text-accent-green' },
            { v: 'TRANSFER', l: 'Transfer', c: 'text-primary-400' },
          ].map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setValue('type', opt.v)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                type === opt.v
                  ? `bg-white/10 ${opt.c}`
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>

        <Input
          label="Amount (₹)"
          type="number"
          step="0.01"
          placeholder="0.00"
          error={errors.amount?.message}
          {...register('amount')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-base">From Account</label>
            <select
              className="input-base"
              {...register('accountId')}
            >
              <option value="">Select account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.type})
                </option>
              ))}
            </select>
            {errors.accountId && (
              <p className="mt-1 text-xs text-accent-red">
                {errors.accountId.message}
              </p>
            )}
          </div>

          {type === 'TRANSFER' ? (
            <div>
              <label className="label-base">To Account</label>
              <select className="input-base" {...register('toAccountId')}>
                <option value="">Select account</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.type})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="label-base">Category</label>
              <select className="input-base" {...register('categoryId')}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <Input
          label="Date & Time"
          type="datetime-local"
          error={errors.transactionDate?.message}
          {...register('transactionDate')}
        />

        <Input
          label="Description"
          placeholder="e.g. Lunch with team"
          error={errors.description?.message}
          {...register('description')}
        />

        <Input
          label="Merchant (optional)"
          placeholder="e.g. Zomato"
          {...register('merchantName')}
        />

        <div>
          <label className="label-base">Notes (optional)</label>
          <textarea
            className="input-base min-h-[80px]"
            placeholder="Additional notes..."
            {...register('notes')}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            {isEdit ? 'Update' : 'Create'} Transaction
          </Button>
        </div>
      </form>
    </Modal>
  );
}