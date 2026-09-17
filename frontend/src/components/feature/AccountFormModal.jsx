import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { ACCOUNT_TYPES } from '../../utils/constants';
import {
  useCreateAccount,
  useUpdateAccount,
} from '../../hooks/queries/useAccounts';

const schema = z.object({
  name: z.string().min(1, 'Name required').max(100),
  type: z.enum([
    'CASH', 'BANK', 'UPI', 'CREDIT_CARD',
    'SAVINGS', 'INVESTMENT', 'OTHER',
  ]),
  openingBalance: z.coerce.number().default(0),
  accountNumber: z.string().max(50).optional(),
  bankName: z.string().max(100).optional(),
  ifscCode: z.string().max(20).optional(),
  description: z.string().max(500).optional(),
});

export default function AccountFormModal({ open, onClose, account }) {
  const isEdit = !!account;
  const createMut = useCreateAccount();
  const updateMut = useUpdateAccount();

  const {
    register, handleSubmit, reset, watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { type: 'BANK', openingBalance: 0 },
  });

  const type = watch('type');

  useEffect(() => {
    if (open && account) {
      reset({
        name: account.name,
        type: account.type,
        openingBalance: account.openingBalance ?? 0,
        accountNumber: account.accountNumber || '',
        bankName: account.bankName || '',
        ifscCode: account.ifscCode || '',
        description: account.description || '',
      });
    } else if (open) {
      reset({
        name: '', type: 'BANK', openingBalance: 0,
        accountNumber: '', bankName: '', ifscCode: '', description: '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, account]);

  const onSubmit = (data) => {
    const payload = { ...data };
    if (isEdit) {
      updateMut.mutate({ id: account.id, data: payload }, { onSuccess: onClose });
    } else {
      createMut.mutate(payload, { onSuccess: onClose });
    }
  };

  const isLoading = createMut.isPending || updateMut.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Account' : 'New Account'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Type selector grid */}
        <div>
          <label className="label-base">Account Type</label>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {ACCOUNT_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => reset((d) => ({ ...d, type: t.value }))}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition ${
                  type === t.value
                    ? 'border-primary-500 bg-primary-500/10 text-white'
                    : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                }`}
              >
                <span className="text-xl">{t.icon}</span>
                <span className="text-xs font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Account Name"
          placeholder="e.g. HDFC Savings"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={isEdit ? 'Opening Balance (locked)' : 'Opening Balance (₹)'}
            type="number"
            step="0.01"
            disabled={isEdit}
            error={errors.openingBalance?.message}
            {...register('openingBalance')}
          />
          <Input
            label="Account Number (optional)"
            placeholder="•••• 1234"
            {...register('accountNumber')}
          />
        </div>

        {(type === 'BANK' || type === 'SAVINGS' || type === 'CREDIT_CARD') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Bank Name"
              placeholder="HDFC Bank"
              {...register('bankName')}
            />
            <Input
              label="IFSC Code"
              placeholder="HDFC0001234"
              {...register('ifscCode')}
            />
          </div>
        )}

        <div>
          <label className="label-base">Description (optional)</label>
          <textarea
            className="input-base min-h-[70px]"
            placeholder="What is this account for?"
            {...register('description')}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            {isEdit ? 'Update' : 'Create'} Account
          </Button>
        </div>
      </form>
    </Modal>
  );
}